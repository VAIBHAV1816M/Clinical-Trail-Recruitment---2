from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from backend.database.session import get_db
from backend.schemas.enrollment_schema import EnrollmentResponse
from backend.services.enrollment_service import transition_enrollment
from backend.models.waitlist import Waitlist

router = APIRouter(prefix="/trials", tags=["Enrollment"])

@router.post("/{trial_id}/invite/{patient_id}", response_model=EnrollmentResponse)
def invite_patient(trial_id: str, patient_id: str, user_id: str = Query("SYSTEM"), reason: Optional[str] = None, db: Session = Depends(get_db)):
    try:
        return transition_enrollment(db, patient_id, trial_id, "INVITED", user_id, reason)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{trial_id}/accept/{patient_id}", response_model=EnrollmentResponse)
def accept_invite(trial_id: str, patient_id: str, user_id: str = Query("SYSTEM"), reason: Optional[str] = None, db: Session = Depends(get_db)):
    try:
        return transition_enrollment(db, patient_id, trial_id, "ACCEPTED", user_id, reason)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{trial_id}/decline/{patient_id}", response_model=EnrollmentResponse)
def decline_invite(trial_id: str, patient_id: str, user_id: str = Query("SYSTEM"), reason: Optional[str] = None, db: Session = Depends(get_db)):
    try:
        return transition_enrollment(db, patient_id, trial_id, "DECLINED", user_id, reason)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{trial_id}/enroll/{patient_id}", response_model=EnrollmentResponse)
def enroll_patient(trial_id: str, patient_id: str, user_id: str = Query("SYSTEM"), reason: Optional[str] = None, db: Session = Depends(get_db)):
    try:
        return transition_enrollment(db, patient_id, trial_id, "ENROLLED", user_id, reason)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{trial_id}/drop/{patient_id}", response_model=EnrollmentResponse)
def drop_patient(trial_id: str, patient_id: str, user_id: str = Query("SYSTEM"), reason: Optional[str] = None, db: Session = Depends(get_db)):
    try:
        return transition_enrollment(db, patient_id, trial_id, "DROPPED", user_id, reason)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{trial_id}/waitlist")
def get_waitlist(trial_id: str, db: Session = Depends(get_db)):
    return db.query(Waitlist).filter_by(trial_id=trial_id).order_by(Waitlist.rank.asc()).all()