from pydantic import BaseModel
from typing import Literal

class NotificationSend(BaseModel):
    patient_id: str
    trial_id: str
    message: str
    channel: str

class NotificationRespond(BaseModel):
    # Strict literal enforcement prevents typo-based database pollution
    response: Literal["ACCEPTED", "DECLINED", "NONE"]

class NotificationResponse(BaseModel):
    notification_id: int
    patient_id: str
    trial_id: str
    message: str
    channel: str
    delivery_status: str
    response: str

    class Config:
        from_attributes = True
