from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from backend.database.session import get_db
from backend.schemas.enrollment_schema import EnrollmentResponse
from backend.services.enrollment_service import transition_enrollment
from backend.models.waitlist import Waitlist
from backend.models.patient import Patient
from backend.models.user import User
from backend.models.enrollment import Enrollment
from backend.api.auth_deps import get_optional_current_user, require_patient

router = APIRouter(prefix="/trials", tags=["Enrollment"])

@router.get("/enrollments/my", response_model=List[EnrollmentResponse])
def get_my_enrollments(
    auth_data: tuple = Depends(require_patient),
    db: Session = Depends(get_db)
):
    """Retrieve all enrollments/invitations strictly for the authenticated patient (Data Ownership)."""
    user, patient = auth_data
    if not patient:
        patient = db.query(Patient).filter_by(user_id=user.id).first()
    if not patient:
        return []
    return db.query(Enrollment).filter_by(patient_id=patient.patient_id).all()

@router.post("/{trial_id}/invite/{patient_id}", response_model=EnrollmentResponse)
def invite_patient(
    trial_id: str, 
    patient_id: str, 
    user_id: str = Query("SYSTEM"), 
    reason: Optional[str] = None, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    if current_user and current_user.role == "PATIENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Patients cannot issue study invitations."
        )
    actor_id = current_user.email if current_user else user_id
    try:
        return transition_enrollment(db, patient_id, trial_id, "INVITED", actor_id, reason)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{trial_id}/accept/{patient_id}", response_model=EnrollmentResponse)
def accept_invite(
    trial_id: str, 
    patient_id: str, 
    user_id: str = Query("SYSTEM"), 
    reason: Optional[str] = None, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    if current_user and current_user.role == "PATIENT":
        patient = db.query(Patient).filter_by(user_id=current_user.id).first()
        if not patient or patient.patient_id != patient_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: You can only accept invitations for yourself."
            )
    actor_id = current_user.email if current_user else user_id
    try:
        return transition_enrollment(db, patient_id, trial_id, "ACCEPTED", actor_id, reason)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{trial_id}/decline/{patient_id}", response_model=EnrollmentResponse)
def decline_invite(
    trial_id: str, 
    patient_id: str, 
    user_id: str = Query("SYSTEM"), 
    reason: Optional[str] = None, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    if current_user and current_user.role == "PATIENT":
        patient = db.query(Patient).filter_by(user_id=current_user.id).first()
        if not patient or patient.patient_id != patient_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: You can only decline invitations for yourself."
            )
    actor_id = current_user.email if current_user else user_id
    try:
        return transition_enrollment(db, patient_id, trial_id, "DECLINED", actor_id, reason)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{trial_id}/enroll/{patient_id}", response_model=EnrollmentResponse)
def enroll_patient(
    trial_id: str, 
    patient_id: str, 
    user_id: str = Query("SYSTEM"), 
    reason: Optional[str] = None, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    if current_user and current_user.role == "PATIENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Patients cannot perform final enrollment confirmation."
        )
    actor_id = current_user.email if current_user else user_id
    try:
        return transition_enrollment(db, patient_id, trial_id, "ENROLLED", actor_id, reason)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{trial_id}/drop/{patient_id}", response_model=EnrollmentResponse)
def drop_patient(
    trial_id: str, 
    patient_id: str, 
    user_id: str = Query("SYSTEM"), 
    reason: Optional[str] = None, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    if current_user and current_user.role == "PATIENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Patients cannot drop other participants."
        )
    actor_id = current_user.email if current_user else user_id
    try:
        return transition_enrollment(db, patient_id, trial_id, "DROPPED", actor_id, reason)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{trial_id}/waitlist")
def get_waitlist(
    trial_id: str, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    if current_user and current_user.role == "PATIENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Patients cannot view the internal study waitlist registry."
        )
    return db.query(Waitlist).filter_by(trial_id=trial_id).order_by(Waitlist.rank.asc()).all()