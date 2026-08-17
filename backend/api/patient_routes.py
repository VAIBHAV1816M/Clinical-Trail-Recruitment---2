from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List
from backend.database.session import get_db
from backend.schemas.patient_schema import PatientCreate, PatientUpdate, PatientResponse, BatchUploadResponse
from backend.services.patient_service import create_patient, list_patients
from backend.services.batch_upload_service import process_batch_upload
from backend.models.patient import Patient
from backend.utils.audit import create_audit_log

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/", response_model=List[PatientResponse])
def get_all_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return list_patients(db, skip=skip, limit=limit)

@router.post("/", response_model=PatientResponse)
def register_patient(patient: PatientCreate, force: bool = False, db: Session = Depends(get_db)):
    result = create_patient(db, patient, force=force)
    if result.get("is_duplicate"):
        raise HTTPException(status_code=409, detail={"message": "Duplicate found", "details": result["details"]})
    return result["patient"]

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(patient_id: str, patient_update: PatientUpdate, user_id: str = Query("SYSTEM"), db: Session = Depends(get_db)):
    patient = db.query(Patient).filter_by(patient_id=patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    update_data = patient_update.model_dump(exclude_unset=True)
    
    # FIX: Strictly enforce active_trial_id invariant at the route level
    update_data.pop("active_trial_id", None)
        
    for key, value in update_data.items():
        old_val = getattr(patient, key)
        if old_val != value:
            setattr(patient, key, value)
            
            # FIX: Audit log for direct demographic updates
            create_audit_log(
                db=db, user_id=user_id, action="UPDATE_PATIENT",
                entity_type="Patient", entity_id=patient_id,
                old_value=str(old_val), new_value=str(value), reason=f"Updated {key}"
            )
            
    db.commit()
    db.refresh(patient)
    return patient

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter_by(patient_id=patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.post("/batch-upload", response_model=BatchUploadResponse)
def batch_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.xls', '.xlsx')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an Excel file.")
    return process_batch_upload(db, file.file)

@router.post("/generate-virtual")
def generate_virtual_patient():
    return {"message": "Virtual patient generation endpoint (To be implemented)."}