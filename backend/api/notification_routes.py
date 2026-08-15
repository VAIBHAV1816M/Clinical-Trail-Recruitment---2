from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database.session import get_db
from backend.schemas.notification_schema import NotificationSend, NotificationRespond, NotificationResponse
from backend.services.notification_service import send_notification, respond_to_notification
from backend.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/send", response_model=NotificationResponse)
def send_notification_route(payload: NotificationSend, db: Session = Depends(get_db)):
    try:
        return send_notification(db, payload.patient_id, payload.trial_id, payload.message, payload.channel)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{patient_id}", response_model=List[NotificationResponse])
def get_patient_notifications(patient_id: str, db: Session = Depends(get_db)):
    return db.query(Notification).filter_by(patient_id=patient_id).all()

@router.post("/{notification_id}/respond", response_model=NotificationResponse)
def respond_notification_route(notification_id: int, payload: NotificationRespond, db: Session = Depends(get_db)):
    try:
        return respond_to_notification(db, notification_id, payload.response)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
