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

def confirm_criteria(db: Session, trial_data: TrialCreate, criteria: List[CriterionCreate], provided_trial_id: str = None) -> Trial:
    """
    Manual/Review Path: Commits the Trial and its Criteria to the database.
    Accepts an optional provided_trial_id to support confirming an in-progress draft route.
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
                
    db_trial = Trial(
        trial_id=trial_id,
        trial_name=trial_data.trial_name,
        description=trial_data.description,
        source_type=trial_data.source_type,
        target_recruitment=trial_data.target_recruitment,
        original_text=trial_data.original_text,
        status="OPEN"  # Correct status vocabulary
    )
    db.add(db_trial)
    
    for crit in criteria:
        db.add(TrialCriterion(trial_id=trial_id, **crit.model_dump()))
        
    db.commit()
    db.refresh(db_trial)
    
    return db_trial