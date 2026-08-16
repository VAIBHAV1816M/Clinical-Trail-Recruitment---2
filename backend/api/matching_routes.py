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
    On-demand matching (persist=False).
    Does NOT generate a screening_id - response.data.screening_id and
    response.data.screened_at will be null. Safe for polling.
    """
    try:
        result = screen_patient_for_trial(db, patient_id, trial_id, persist=False)
        return {"data": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/screen/", response_model=MatchResponse)
def persist_screening(req: ScreenRequest, db: Session = Depends(get_db)):
    """
    Persisted screening (persist=True).
    Generates a screening_id for human-in-the-loop verification.
    """
    try:
        result = screen_patient_for_trial(db, req.patient_id, req.trial_id, persist=True)
        return {"data": result}
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