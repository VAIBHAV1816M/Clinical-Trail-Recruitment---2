from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
from datetime import datetime

class UserRegister(BaseModel):
    email: str
    password: str
    role: Literal["RESEARCHER", "PATIENT"] = "RESEARCHER"
    
    # Common profile fields
    name: str
    
    # Researcher-specific fields (Optional, no demo defaults)
    organization: Optional[str] = None
    designation: Optional[str] = None
    specialization: Optional[str] = None
    contact: Optional[str] = None
    
    # Patient-specific optional link to existing patient record
    patient_id: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ResearcherProfileResponse(BaseModel):
    id: int
    user_id: int
    name: str
    organization: Optional[str] = None
    designation: Optional[str] = None
    specialization: Optional[str] = None
    contact: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class PatientProfileSummaryResponse(BaseModel):
    patient_id: str
    user_id: Optional[int] = None
    name: str
    gender: Optional[str] = None
    dob: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    active_trial_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    role: str
    name: str
    profile_id: Optional[str] = None  # researcher ID (int as str) or patient_id (e.g. 'P000001')
    researcher: Optional[ResearcherProfileResponse] = None
    patient: Optional[PatientProfileSummaryResponse] = None

class AuthMeResponse(BaseModel):
    user_id: int
    email: str
    role: str
    is_active: bool
    researcher: Optional[ResearcherProfileResponse] = None
    patient: Optional[PatientProfileSummaryResponse] = None
