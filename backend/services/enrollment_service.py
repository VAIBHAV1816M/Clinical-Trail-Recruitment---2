from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.models.enrollment import Enrollment
from backend.models.patient import Patient
from backend.models.waitlist import Waitlist
from backend.utils.audit import create_audit_log

# FIX: Strict state-machine validation
VALID_TRANSITIONS = {
    "PENDING": ["INVITED"],
    "INVITED": ["ACCEPTED", "DECLINED"],
    "ACCEPTED": ["ENROLLED", "DECLINED"],
    "ENROLLED": ["DROPPED"],
    "DECLINED": [],
    "DROPPED": []
}

def _get_or_create_enrollment(db: Session, patient_id: str, trial_id: str) -> Enrollment:
    enr = db.query(Enrollment).filter_by(patient_id=patient_id, trial_id=trial_id).first()
    if not enr:
        enr = Enrollment(patient_id=patient_id, trial_id=trial_id, status="PENDING")
        db.add(enr)
        db.flush()
    return enr

def transition_enrollment(
    db: Session, patient_id: str, trial_id: str, new_status: str, 
    user_id: str, reason: str = None, commit: bool = True
) -> Enrollment:
    """
    Executes a strict lifecycle transition.
    commit=True by default, but allows commit=False for atomic recursive waitlist promotions.
    """
    enr = _get_or_create_enrollment(db, patient_id, trial_id)
    patient = db.query(Patient).filter_by(patient_id=patient_id).first()
    
    old_status = enr.status
    now = datetime.now(timezone.utc)
    
    # State-machine guardrail (allow idempotent calls)
    if new_status not in VALID_TRANSITIONS.get(old_status, []) and old_status != new_status:
        raise ValueError(f"Invalid state transition: Cannot move from {old_status} to {new_status}")
        
    enr.status = new_status
    
    if new_status == "INVITED":
        enr.invited_at = now
    elif new_status == "ACCEPTED":
        enr.accepted_at = now
    elif new_status == "DECLINED":
        enr.declined_at = now
    elif new_status == "ENROLLED":
        enr.enrolled_at = now
        patient.active_trial_id = trial_id 
    elif new_status == "DROPPED":
        enr.dropped_at = now
        if patient.active_trial_id == trial_id:
            patient.active_trial_id = None
            
        # Auto-promote the highest WAITING candidate
        next_waitlist = db.query(Waitlist).filter_by(trial_id=trial_id, status="WAITING").order_by(Waitlist.rank.asc()).first()
        if next_waitlist:
            next_waitlist.status = "PROMOTED"
            # FIX: Pass commit=False to prevent mid-flight commits during recursion
            transition_enrollment(
                db, next_waitlist.patient_id, trial_id, "ENROLLED", 
                "SYSTEM", "Auto-promoted from waitlist", commit=False
            )
            
    create_audit_log(
        db=db, user_id=user_id, action=f"ENROLLMENT_{new_status}", 
        entity_type="Enrollment", entity_id=str(enr.enrollment_id), 
        old_value=old_status, new_value=new_status, reason=reason
    )
    
    # FIX: Top-level orchestration of the transaction
    if commit:
        db.commit()
        db.refresh(enr)
    else:
        db.flush()
        
    return enr