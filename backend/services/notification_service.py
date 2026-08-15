from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.models.notification import Notification
from backend.models.patient import Patient
from backend.models.trial import Trial

def send_notification(db: Session, patient_id: str, trial_id: str, message: str, channel: str) -> Notification:
    # Explicit existence checks to safely raise ValueError instead of a 500 IntegrityError
    patient = db.query(Patient).filter_by(patient_id=patient_id).first()
    if not patient:
        raise ValueError(f"Patient with ID {patient_id} not found.")

    trial = db.query(Trial).filter_by(trial_id=trial_id).first()
    if not trial:
        raise ValueError(f"Trial with ID {trial_id} not found.")

    notif = Notification(
        patient_id=patient_id,
        trial_id=trial_id,
        message=message,
        channel=channel,
        delivery_status="PENDING",
        response="NONE"
    )
    db.add(notif)
    db.flush()

    dispatch_successful = True 

    if dispatch_successful:
        notif.delivery_status = "SENT"
        notif.sent_at = datetime.now(timezone.utc)
    else:
        notif.delivery_status = "FAILED"

    db.commit()
    db.refresh(notif)
    return notif

def respond_to_notification(db: Session, notification_id: int, response_status: str) -> Notification:
    notif = db.query(Notification).filter_by(notification_id=notification_id).first()
    if not notif:
        raise ValueError("Notification not found.")

    notif.response = response_status
    db.commit()
    db.refresh(notif)
    return notif
