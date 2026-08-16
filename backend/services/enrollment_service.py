from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.models.enrollment import Enrollment
from backend.models.patient import Patient
from backend.models.waitlist import Waitlist
from backend.utils.audit import create_audit_log

# FIX: Added `None` to handle the very first creation step safely
VALID_TRANSITIONS = {
    None: ["INVITED"], 
    "PENDING": ["INVITED"],  # Kept for safety if any legacy data exists
    "INVITED": ["ACCEPTED", "DECLINED"],
    "ACCEPTED": ["ENROLLED", "DECLINED"],
    "ENROLLED": ["DROPPED"],
    "DECLINED": [],
    "DROPPED": []
}

def transition_enrollment(
    db: Session, patient_id: str, trial_id: str, new_status: str, 
    user_id: str, reason: str = None, commit: bool = True
) -> Enrollment:
    """
    Executes a strict lifecycle transition.
    commit=True by default, but allows commit=False for atomic recursive waitlist promotions.
    """
    # 1. Look up existing enrollment
    enr = db.query(Enrollment).filter_by(patient_id=patient_id, trial_id=trial_id).first()
    old_status = enr.status if enr else None
    
    # 2. State-machine guardrail (allow idempotent calls)
    if new_status not in VALID_TRANSITIONS.get(old_status, []) and old_status != new_status:
        raise ValueError(f"Invalid state transition: Cannot move from {old_status} to {new_status}")
        
    now = datetime.now(timezone.utc)
    
    # 3. Create or Update (Directly using valid new_status to avoid DB CheckViolations)
    if not enr:
        enr = Enrollment(patient_id=patient_id, trial_id=trial_id, status=new_status)
        db.add(enr)
        db.flush()  # Flushes safely now, and generates enr.enrollment_id for the audit log
    else:
        enr.status = new_status

    # 4. Handle time-stamps and side effects
    if new_status == "INVITED":
        enr.invited_at = now
    elif new_status == "ACCEPTED":
        enr.accepted_at = now
    elif new_status == "DECLINED":
        enr.declined_at = now
    elif new_status == "ENROLLED":
        enr.enrolled_at = now
        patient = db.query(Patient).filter_by(patient_id=patient_id).first()
        if patient:
            patient.active_trial_id = trial_id 
    elif new_status == "DROPPED":
        enr.dropped_at = now
        patient = db.query(Patient).filter_by(patient_id=patient_id).first()
        if patient and patient.active_trial_id == trial_id:
            patient.active_trial_id = None
            
        # Auto-promote the highest WAITING candidate
        next_waitlist = db.query(Waitlist).filter_by(trial_id=trial_id, status="WAITING").order_by(Waitlist.rank.asc()).first()
        if next_waitlist:
            next_waitlist.status = "PROMOTED"
            # Pass commit=False to prevent mid-flight commits during recursion
            transition_enrollment(
                db, next_waitlist.patient_id, trial_id, "ENROLLED", 
                "SYSTEM", "Auto-promoted from waitlist", commit=False
            )
            
    # 5. Create audit log BEFORE the final commit
    create_audit_log(
        db=db, user_id=user_id, action=f"ENROLLMENT_{new_status}", 
        entity_type="Enrollment", entity_id=str(enr.enrollment_id), 
        old_value=str(old_status) if old_status else "NONE", new_value=new_status, reason=reason
    )
    
    # 6. Top-level orchestration of the transaction
    if commit:
        db.commit()
        db.refresh(enr)
    else:
        db.flush()
        
    return enr