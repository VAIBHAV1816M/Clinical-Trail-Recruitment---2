from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database.session import get_db
from backend.schemas.matching_schema import (
    MatchResponse,
    ScreeningResultResponse,
    CandidateResult,
    TrialCandidateResult,
    ScreenRequest,
)
from backend.services.matching_service import (
    screen_patient_for_trial,
    find_trials_for_patient,
    find_patients_for_trial,
)

router = APIRouter(prefix="/matching", tags=["Matching"])


@router.get("/patient/{patient_id}/trial/{trial_id}", response_model=MatchResponse)
def match_patient_to_trial(patient_id: str, trial_id: str, db: Session = Depends(get_db)):
    """
    Read-only, in-memory scoring lookup - does NOT persist a ScreeningResult
    (safe to poll, e.g. from search-as-you-type). Use POST /matching/screen/
    if you need a persisted, verifiable screening_id.
    """
    try:
        result = screen_patient_for_trial(db, patient_id, trial_id, persist=False)
        return {"data": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/screen/", response_model=ScreeningResultResponse)
def persist_screening(payload: ScreenRequest, db: Session = Depends(get_db)):
    """
    TASK 2: Persisted screening endpoint.

    Runs the same matching logic as the read-only GET lookup above, but
    actually saves the ScreeningResult row and returns the generated
    screening_id - which is required before a result can be sent through
    POST /verification/{screening_id}/verify or /override.

    Request body:
        { "patient_id": "P000123", "trial_id": "T001" }

    Response (200): ScreeningResultResponse, e.g.
        {
          "screening_id": 42,
          "patient_id": "P000123",
          "trial_id": "T001",
          "vitals_id": 7,
          "match_percentage": 82.5,
          "verdict": "APPROVED",
          "eligible": true,
          "criteria_snapshot": { "criteria_used": [...], "explanations": [...] },
          "screened_at": "2026-08-16T12:34:56Z"
        }
    404 if patient_id or trial_id doesn't exist.
    """
    try:
        result = screen_patient_for_trial(db, payload.patient_id, payload.trial_id, persist=True)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/patient/{patient_id}/trials", response_model=List[TrialCandidateResult])
def get_trials_for_patient(patient_id: str, db: Session = Depends(get_db)):
    """
    Find all OPEN trials a given patient is currently eligible for.
    Business logic lives in matching_service.find_trials_for_patient - this
    route only translates the ValueError into an HTTP 404.
    """
    try:
        return find_trials_for_patient(db, patient_id, persist=False)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/trial/{trial_id}/patients", response_model=List[CandidateResult])
def get_patients_for_trial(trial_id: str, db: Session = Depends(get_db)):
    """Rank all patients against one trial (bulk scoring - can be slow for large patient counts)."""
    try:
        return find_patients_for_trial(db, trial_id, persist=False)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))