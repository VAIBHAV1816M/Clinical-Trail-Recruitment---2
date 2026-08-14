from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
from datetime import datetime

class NotificationSend(BaseModel):
    patient_id: str
    trial_id: str
    message: str
    channel: str

class NotificationRespond(BaseModel):
    response: Literal["ACCEPTED", "DECLINED"]

class NotificationResponse(BaseModel):
    notification_id: int
    patient_id: str
    trial_id: str
    message: str
    channel: str
    
    delivery_status: str
    response: str
    sent_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)