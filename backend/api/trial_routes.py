from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database.session import get_db
from backend.schemas.trial_schema import TrialCreate, TrialUpdate, TrialResponse
from backend.schemas.criterion_schema import CriterionCreate
from backend.services.trial_service import create_draft, confirm_criteria
from backend.services.pdf_service import extract_text_from_pdf
from backend.models.trial import Trial
from backend.utils.audit import create_audit_log

router = APIRouter(prefix="/trials", tags=["Trials"])

@router.get("/", response_model=List[TrialResponse])
def get_all_trials(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Trial).offset(skip).limit(limit).all()

@router.post("/", response_model=TrialResponse)
def create_manual_trial(trial_data: TrialCreate, criteria: List[CriterionCreate], db: Session = Depends(get_db)):
    return confirm_criteria(db, trial_data, criteria)

@router.post("/draft", response_model=List[CriterionCreate])
def create_trial_draft(file: Optional[UploadFile] = File(None), text: Optional[str] = Form(None)):
    if file:
        content = file.file.read()
        extracted_text = extract_text_from_pdf(content)
        return create_draft(extracted_text)
    elif text:
        return create_draft(text)
    else:
        raise HTTPException(status_code=400, detail="Must provide either 'file' or 'text'.")

@router.post("/{trial_id}/confirm-criteria", response_model=TrialResponse)
def confirm_trial_criteria(trial_id: str, trial_data: TrialCreate, criteria: List[CriterionCreate], db: Session = Depends(get_db)):
    # FIX: Now explicitly passes the targeted trial_id into the service
    return confirm_criteria(db, trial_data, criteria, provided_trial_id=trial_id)

@router.put("/{trial_id}", response_model=TrialResponse)
def update_trial(trial_id: str, trial_update: TrialUpdate, user_id: str = Query("SYSTEM"), db: Session = Depends(get_db)):
    trial = db.query(Trial).filter_by(trial_id=trial_id).first()
    if not trial:
        raise HTTPException(status_code=404, detail="Trial not found")
        
    for key, value in trial_update.model_dump(exclude_unset=True).items():
        old_val = getattr(trial, key)
        if old_val != value:
            setattr(trial, key, value)
            
            # FIX: Audit log for trial updates
            create_audit_log(
                db=db, user_id=user_id, action="UPDATE_TRIAL",
                entity_type="Trial", entity_id=trial_id,
                old_value=str(old_val), new_value=str(value), reason=f"Updated {key}"
            )
        
    db.commit()
    db.refresh(trial)
    return trial

@router.get("/{trial_id}", response_model=TrialResponse)
def get_trial(trial_id: str, db: Session = Depends(get_db)):
    trial = db.query(Trial).filter_by(trial_id=trial_id).first()
    if not trial:
        raise HTTPException(status_code=404, detail="Trial not found")
    return trial