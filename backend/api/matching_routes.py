from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database.session import get_db
from backend.schemas.matching_schema import MatchResponse, CandidateResult
from backend.services.matching_service import screen_patient_for_trial, find_patients_for_trial
from backend.models.trial import Trial
from backend.models.patient import Patient

router = APIRouter(prefix="/matching", tags=["Matching"])

@router.get("/patient/{patient_id}/trial/{trial_id}")
def match_patient_to_trial(patient_id: str, trial_id: str, db: Session = Depends(get_db)):
    try:
        # A specific targeted lookup GET should not persist a new database row
        result = screen_patient_for_trial(db, patient_id, trial_id, persist=False)
        return {"data": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/patient/{patient_id}/trials", response_model=List[CandidateResult])
def find_trials_for_patient(patient_id: str, db: Session = Depends(get_db)):
    # Look up the dynamic patient name rather than hardcoding it
    patient = db.query(Patient).filter_by(patient_id=patient_id).first()
    if not patient:
         raise HTTPException(status_code=404, detail="Patient not found.")
         
    trials = db.query(Trial).filter_by(status="OPEN").all()
    candidates = []
    
    for trial in trials:
        try:
            # FIX: Ensure persist=False so a GET poll doesn't flood the audit table
            res = screen_patient_for_trial(db, patient_id, trial.trial_id, persist=False)
            if res.get("eligible"):
                candidates.append(CandidateResult(
                    patient_id=patient_id, 
                    patient_name=patient.name, 
                    match_percentage=res.get("match_percentage"), 
                    verdict=res.get("verdict"), 
                    gaps=[exp["message"] for exp in res["criteria_snapshot"]["explanations"] if not exp.get("passed")]
                ))
        except ValueError:
            continue
            
    return candidates

# FIX: Dropped unused 'sort' parameter. Changed response model to match the List shape.
@router.get("/trial/{trial_id}/patients", response_model=List[CandidateResult])
def get_patients_for_trial(trial_id: str, db: Session = Depends(get_db)):
    try:
        # FIX: Ensure persist=False on a GET request
        candidates_dict = find_patients_for_trial(db, trial_id, persist=False)
        return [CandidateResult(**c) for c in candidates_dict]
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))