from sqlalchemy.orm import Session, joinedload
from backend.models.patient import Patient
from backend.models.trial import Trial
from backend.models.screening import ScreeningResult
from backend.matching.engine import run_matching_engine
from typing import List, Dict, Any


def _get_patient_eager(db: Session, patient_id: str) -> Patient:
    return db.query(Patient).options(
        joinedload(Patient.vitals),
        joinedload(Patient.conditions),
        joinedload(Patient.allergies)
    ).filter(Patient.patient_id == patient_id).first()


def _get_trial_eager(db: Session, trial_id: str) -> Trial:
    return db.query(Trial).options(
        joinedload(Trial.criteria)
    ).filter(Trial.trial_id == trial_id).first()


def _compute_gaps(criteria_snapshot: dict) -> List[str]:
    """
    BUG FIX: explainability.py always marks SOFT explanations as passed=True
    (soft criteria don't "fail" - that's the whole point of them being soft),
    so filtering on `not exp["passed"]` never finds anything for an eligible
    candidate - "gaps" was always an empty list. A meaningful gap is instead
    a SOFT criterion that contributed less than its max possible score, i.e.
    an imperfect but non-disqualifying match worth surfacing to a reviewer.
    """
    explanations = (criteria_snapshot or {}).get("explanations", [])
    return [
        exp["message"] for exp in explanations
        if exp.get("type") == "SOFT" and exp.get("score", 0) < exp.get("max_score", 0)
    ]


def _persist_screening(db: Session, patient_id: str, trial_id: str, result: Dict[str, Any]) -> ScreeningResult:
    db_screening = ScreeningResult(
        patient_id=patient_id,
        trial_id=trial_id,
        vitals_id=result.get("vitals_id"),
        match_percentage=result["match_percentage"],
        verdict=result["verdict"],
        eligible=result["eligible"],
        criteria_snapshot=result["criteria_snapshot"]
    )
    db.add(db_screening)
    return db_screening


def screen_patient_for_trial(db: Session, patient_id: str, trial_id: str, persist: bool = True) -> Dict[str, Any]:
    """
    Mode 1: Single patient vs Single trial.
    If persist=True, saves the screening result to the database and the
    returned dict is enriched with DB-generated fields (screening_id, screened_at).
    """
    patient = _get_patient_eager(db, patient_id)
    trial = _get_trial_eager(db, trial_id)

    if not patient or not trial:
        raise ValueError("Patient or Trial not found.")

    result = run_matching_engine(patient, trial)

    # BUG FIX (patient_id/trial_id missing from response): run_matching_engine()
    # is deliberately patient/trial-agnostic in its return shape - it doesn't know
    # (or need to know) which specific patient/trial it was called with, so it never
    # includes those keys. That's fine for the engine's own unit tests, but it means
    # the dict this function returns was missing two REQUIRED fields on
    # ScreeningResultResponse, and the untyped GET/POST matching routes were the
    # only reason that went unnoticed (no response_model was validating the shape).
    # Inject them here, once, so every caller - persisted or not - gets a complete,
    # schema-valid result without the engine needing to know about IDs at all.
    result = {**result, "patient_id": patient.patient_id, "trial_id": trial.trial_id}

    if persist:
        db_screening = _persist_screening(db, patient.patient_id, trial.trial_id, result)
        db.commit()
        db.refresh(db_screening)
        # Merge in DB-generated fields so callers (e.g. the /screen/ endpoint)
        # get screening_id and screened_at back without a second query.
        result = {
            **result,
            "screening_id": db_screening.screening_id,
            "screened_at": db_screening.screened_at,
        }

    return result


def find_trials_for_patient(db: Session, patient_id: str, persist: bool = False) -> List[dict]:
    """
    Mode 2: Rank all OPEN trials for a single patient. Returns lightweight
    per-trial candidate dicts (trial_id/trial_name, NOT patient_id/patient_name -
    since we're iterating over trials for one already-known patient, the
    patient identity is constant and the trial identity is what varies).

    This used to live inline inside the API route, which put business logic
    in the route layer - moved here to match the rest of the codebase's
    routes-are-thin convention, and so it can share _persist_screening /
    _compute_gaps with the other two modes instead of duplicating them.
    """
    patient = _get_patient_eager(db, patient_id)
    if not patient:
        raise ValueError("Patient not found.")

    trials = db.query(Trial).options(joinedload(Trial.criteria)).filter(Trial.status == "OPEN").all()

    candidates = []
    for trial in trials:
        try:
            if persist:
                with db.begin_nested():
                    res = run_matching_engine(patient, trial)
                    _persist_screening(db, patient.patient_id, trial.trial_id, res)
            else:
                res = run_matching_engine(patient, trial)

            if res["eligible"]:
                candidates.append({
                    "trial_id": trial.trial_id,
                    "trial_name": trial.trial_name,
                    "match_percentage": res["match_percentage"],
                    "verdict": res["verdict"],
                    "gaps": _compute_gaps(res["criteria_snapshot"]),
                })
        except Exception:
            continue

    if persist:
        db.commit()

    return sorted(candidates, key=lambda x: x["match_percentage"], reverse=True)


def find_patients_for_trial(db: Session, trial_id: str, persist: bool = False) -> List[dict]:
    """
    Mode 3: Rank all patients for a trial. Returns lightweight candidate dicts.
    If persist=True, logs every evaluation to the database using SAVEPOINT isolation.
    """
    trial = _get_trial_eager(db, trial_id)
    if not trial:
        raise ValueError("Trial not found.")

    # In a real production system with millions of rows, this would be a pre-filtered DB query.
    # For the hackathon scale, we score all patients in memory.
    patients = db.query(Patient).options(
        joinedload(Patient.vitals),
        joinedload(Patient.conditions),
        joinedload(Patient.allergies)
    ).all()

    candidates = []

    for patient in patients:
        try:
            if persist:
                with db.begin_nested():
                    res = run_matching_engine(patient, trial)
                    _persist_screening(db, patient.patient_id, trial.trial_id, res)
            else:
                res = run_matching_engine(patient, trial)

            if res["eligible"]:
                candidates.append({
                    "patient_id": patient.patient_id,
                    "patient_name": patient.name,
                    "match_percentage": res["match_percentage"],
                    "verdict": res["verdict"],
                    "gaps": _compute_gaps(res["criteria_snapshot"]),
                })
        except Exception:
            # Continue the loop for valid patients; let the batch finish
            continue

    if persist:
        db.commit()

    return sorted(candidates, key=lambda x: x["match_percentage"], reverse=True)