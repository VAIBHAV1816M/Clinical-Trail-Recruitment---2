from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.schemas.patient_schema import PatientCreate
from backend.models.patient import Patient, PatientVitals, PatientCondition, PatientAllergy
from backend.utils.patient_id import generate_patient_id
from backend.services.duplicate_service import check_duplicate

def create_patient(db: Session, patient_data: PatientCreate, force: bool = False):
    if not force:
        dup_check = check_duplicate(db, patient_data.name, patient_data.dob, patient_data.phone)
        if dup_check["duplicate"]:
            return {"is_duplicate": True, "details": dup_check, "patient": None}
            
    patient_id = generate_patient_id(db)
    
    # Set consent_given_at only if consent is True
    consent_timestamp = datetime.now(timezone.utc) if patient_data.consent else None
    
    db_patient = Patient(
        patient_id=patient_id,
        name=patient_data.name,
        gender=patient_data.gender,
        dob=patient_data.dob,
        location=patient_data.location,
        phone=patient_data.phone,
        blood_group=patient_data.blood_group,
        previous_surgery=patient_data.previous_surgery,
        smoking=patient_data.smoking,
        alcohol=patient_data.alcohol,
        consent=patient_data.consent,
        consent_given_at=consent_timestamp  # FIX: Timestamp recorded
    )
    db.add(db_patient)
    
    if patient_data.vitals:
        vitals_dict = patient_data.vitals.model_dump(exclude_unset=True)
        db_vitals = PatientVitals(patient_id=patient_id, **vitals_dict)
        db.add(db_vitals)
        
    for cond in patient_data.conditions:
        db.add(PatientCondition(patient_id=patient_id, **cond.model_dump()))
        
    for allergy in patient_data.allergies:
        db.add(PatientAllergy(patient_id=patient_id, **allergy.model_dump()))
        
    db.commit()
    db.refresh(db_patient)
    
    return {"is_duplicate": False, "details": None, "patient": db_patient}