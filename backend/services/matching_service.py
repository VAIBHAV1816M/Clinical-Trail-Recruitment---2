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

def screen_patient_for_trial(db: Session, patient_id: str, trial_id: str, persist: bool = True) -> Dict[str, Any]:
    """
    Mode 1: Single patient vs Single trial.
    If persist=True, saves the screening result to the database.
    """
    patient = _get_patient_eager(db, patient_id)
    trial = _get_trial_eager(db, trial_id)
    
    if not patient or not trial:
        raise ValueError("Patient or Trial not found.")
        
    result = run_matching_engine(patient, trial)
    
    # Only write to DB if the route requested persistence
    if persist:
        db_screening = ScreeningResult(
            patient_id=patient.patient_id,
            trial_id=trial.trial_id,
            vitals_id=result.get("vitals_id"),
            match_percentage=result["match_percentage"],
            verdict=result["verdict"],
            eligible=result["eligible"],
            criteria_snapshot=result["criteria_snapshot"]
        )
        
        db.add(db_screening)
        db.commit()
        db.refresh(db_screening)
        
    return result

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
            # If persisting, we need nested transaction isolation so one failure doesn't nuke the batch
            if persist:
                with db.begin_nested():
                    res = run_matching_engine(patient, trial)
                    
                    db_screening = ScreeningResult(
                        patient_id=patient.patient_id,
                        trial_id=trial.trial_id,
                        vitals_id=res.get("vitals_id"),
                        match_percentage=res["match_percentage"],
                        verdict=res["verdict"],
                        eligible=res["eligible"],
                        criteria_snapshot=res["criteria_snapshot"]
                    )
                    db.add(db_screening)
            else:
                # If not persisting, we just run the engine purely in memory
                res = run_matching_engine(patient, trial)
                
            if res["eligible"]:
                candidates.append({
                    "patient_id": patient.patient_id,
                    "patient_name": patient.name,
                    "match_percentage": res["match_percentage"],
                    "verdict": res["verdict"],
                    "gaps": [exp["message"] for exp in res["criteria_snapshot"]["explanations"] if not exp.get("passed")]
                })
        except Exception:
            # Continue the loop for valid patients; let the batch finish
            continue
            
    # Only commit the batch if we actually wrote to the DB
    if persist:
        db.commit()
        
    return sorted(candidates, key=lambda x: x["match_percentage"], reverse=True)