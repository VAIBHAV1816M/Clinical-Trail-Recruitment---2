from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from sqlalchemy import text
from backend.models.trial import Trial
from backend.models.trial_criterion import TrialCriterion
from backend.schemas.trial_schema import TrialCreate
from backend.schemas.criterion_schema import CriterionCreate
from backend.services.llm_service import extract_criteria

def create_draft(text: str) -> List[CriterionCreate]:
    """
    AI Path: Parses text into criteria but DOES NOT save to database.
    """
    return extract_criteria(text)

def confirm_criteria(
    db: Session, 
    trial_data: TrialCreate, 
    criteria: List[CriterionCreate], 
    provided_trial_id: str = None,
    researcher_id: int = None
) -> Trial:
    """
    Manual/Review Path: Commits the Trial and its Criteria to the database.
    Accepts an optional provided_trial_id to support confirming an in-progress draft route,
    and optional researcher_id for ownership.
    """
    # If the route passes an ID, use it. Otherwise mint a new sequential one.
    if provided_trial_id:
        trial_id = provided_trial_id
    else:
        db.execute(text("LOCK TABLE trials IN EXCLUSIVE MODE"))
        max_id_str = db.query(func.max(Trial.trial_id)).scalar()
        
        if not max_id_str:
            trial_id = "T001"
        else:
            try:
                numeric_part = int(max_id_str.replace("T", ""))
                trial_id = f"T{numeric_part + 1:03d}"
            except ValueError:
                trial_id = "T001"
                
    effective_researcher_id = researcher_id or trial_data.researcher_id

    existing_trial = db.query(Trial).filter_by(trial_id=trial_id).first()
    if existing_trial:
        db_trial = existing_trial
        db_trial.trial_name = trial_data.trial_name
        db_trial.description = trial_data.description
        if trial_data.target_recruitment is not None:
            db_trial.target_recruitment = trial_data.target_recruitment
        if effective_researcher_id:
            db_trial.researcher_id = effective_researcher_id
        db_trial.status = "OPEN"
        db.query(TrialCriterion).filter_by(trial_id=trial_id).delete()
    else:
        db_trial = Trial(
            trial_id=trial_id,
            trial_name=trial_data.trial_name,
            description=trial_data.description,
            source_type=trial_data.source_type,
            target_recruitment=trial_data.target_recruitment,
            original_text=trial_data.original_text,
            researcher_id=effective_researcher_id,
            status="OPEN"  # Correct status vocabulary
        )
        db.add(db_trial)
    
    for crit in criteria:
        db.add(TrialCriterion(trial_id=trial_id, **crit.model_dump()))
        
    db.commit()
    db.refresh(db_trial)

    # Automatically notify active registered patients of the newly published trial
    try:
        from backend.models.patient import Patient
        from backend.models.notification import Notification
        from datetime import datetime, timezone

        patients = db.query(Patient).all()
        for p in patients:
            existing_notif = db.query(Notification).filter_by(patient_id=p.patient_id, trial_id=trial_id).first()
            if not existing_notif:
                notif = Notification(
                    patient_id=p.patient_id,
                    trial_id=trial_id,
                    message=f"New Clinical Trial Available: '{db_trial.trial_name}'. Check whether you are eligible.",
                    channel="IN_APP",
                    delivery_status="SENT",
                    response="NONE",
                    sent_at=datetime.now(timezone.utc)
                )
                db.add(notif)
        db.commit()
    except Exception as e:
        # Don't fail trial creation if notification dispatch encounters an error
        pass
    
    return db_trial