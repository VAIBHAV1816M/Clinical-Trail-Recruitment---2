from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Dict, Any

from backend.models.user import User
from backend.models.researcher import Researcher
from backend.models.patient import Patient
from backend.schemas.auth_schema import (
    UserRegister, 
    UserLogin, 
    TokenResponse, 
    AuthMeResponse,
    ResearcherProfileResponse,
    PatientProfileSummaryResponse
)
from backend.utils.security import hash_password, verify_password, create_access_token
from backend.utils.patient_id import generate_patient_id

def _build_token_response(user: User, db: Session) -> TokenResponse:
    """Build TokenResponse including profile payload for Researcher or Patient."""
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role
    }
    access_token = create_access_token(token_data)
    
    researcher_resp = None
    patient_resp = None
    profile_id = None
    name = user.email.split("@")[0].capitalize()

    if user.role == "RESEARCHER":
        researcher = db.query(Researcher).filter_by(user_id=user.id).first()
        if researcher:
            researcher_resp = ResearcherProfileResponse.model_validate(researcher)
            profile_id = str(researcher.id)
            name = researcher.name
    elif user.role == "PATIENT":
        patient = db.query(Patient).filter_by(user_id=user.id).first()
        if patient:
            patient_resp = PatientProfileSummaryResponse(
                patient_id=patient.patient_id,
                user_id=patient.user_id,
                name=patient.name,
                gender=patient.gender,
                dob=patient.dob.isoformat() if patient.dob else None,
                location=patient.location,
                phone=patient.phone,
                active_trial_id=patient.active_trial_id
            )
            profile_id = patient.patient_id
            name = patient.name

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        role=user.role,
        name=name,
        profile_id=profile_id,
        researcher=researcher_resp,
        patient=patient_resp
    )

def register_user(db: Session, payload: UserRegister) -> TokenResponse:
    """Register a new user (Researcher or Patient) and return JWT."""
    existing_user = db.query(User).filter_by(email=payload.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # 1. Create User
    new_user = User(
        email=payload.email.lower().strip(),
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_active=True
    )
    db.add(new_user)
    db.flush()  # Get new_user.id

    # 2. Create independent role profile
    if payload.role == "RESEARCHER":
        researcher = Researcher(
            user_id=new_user.id,
            name=payload.name,
            organization=payload.organization,
            designation=payload.designation,
            specialization=payload.specialization,
            contact=payload.contact
        )
        db.add(researcher)
    elif payload.role == "PATIENT":
        # Always create a new independent patient record unless explicit unlinked patient_id is passed
        new_pid = payload.patient_id if payload.patient_id else generate_patient_id(db)
        existing_patient = db.query(Patient).filter_by(patient_id=new_pid).first() if payload.patient_id else None
        
        if existing_patient and existing_patient.user_id is None:
            existing_patient.user_id = new_user.id
        else:
            if not payload.patient_id:
                new_pid = generate_patient_id(db)
            new_patient = Patient(
                patient_id=new_pid,
                user_id=new_user.id,
                name=payload.name,
                consent=True
            )
            db.add(new_patient)

    db.commit()
    db.refresh(new_user)
    return _build_token_response(new_user, db)

def login_user(db: Session, payload: UserLogin) -> TokenResponse:
    """Authenticate user with email/password and return JWT + profile info."""
    user = db.query(User).filter_by(email=payload.email.lower().strip()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is currently inactive. Please contact administrator."
        )

    return _build_token_response(user, db)

def get_auth_me(current_user: User, db: Session) -> AuthMeResponse:
    """Fetch current user identity and attached role profile."""
    researcher_resp = None
    patient_resp = None

    if current_user.role == "RESEARCHER":
        researcher = db.query(Researcher).filter_by(user_id=current_user.id).first()
        if researcher:
            researcher_resp = ResearcherProfileResponse.model_validate(researcher)
    elif current_user.role == "PATIENT":
        patient = db.query(Patient).filter_by(user_id=current_user.id).first()
        if patient:
            patient_resp = PatientProfileSummaryResponse(
                patient_id=patient.patient_id,
                user_id=patient.user_id,
                name=patient.name,
                gender=patient.gender,
                dob=patient.dob.isoformat() if patient.dob else None,
                location=patient.location,
                phone=patient.phone,
                active_trial_id=patient.active_trial_id
            )

    return AuthMeResponse(
        user_id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        researcher=researcher_resp,
        patient=patient_resp
    )
