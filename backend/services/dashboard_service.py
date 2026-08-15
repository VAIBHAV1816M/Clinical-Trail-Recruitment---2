from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models.trial import Trial
from backend.models.screening import ScreeningResult
from backend.models.enrollment import Enrollment

def get_dashboard_stats(db: Session, trial_id: str) -> dict:
    trial = db.query(Trial).filter_by(trial_id=trial_id).first()
    if not trial:
        raise ValueError("Trial not found.")
        
    screened_count = db.query(func.count(ScreeningResult.screening_id)).filter_by(trial_id=trial_id).scalar()
    approved_count = db.query(func.count(ScreeningResult.screening_id)).filter_by(trial_id=trial_id, verdict="APPROVED").scalar()
    needs_review_count = db.query(func.count(ScreeningResult.screening_id)).filter_by(trial_id=trial_id, verdict="NEEDS_REVIEW").scalar()
    rejected_count = db.query(func.count(ScreeningResult.screening_id)).filter_by(trial_id=trial_id, verdict="REJECTED").scalar()
    
    enrolled_count = db.query(func.count(Enrollment.enrollment_id)).filter_by(trial_id=trial_id, status="ENROLLED").scalar()
    
    # FIX: Exposes a genuine 0 instead of masking it to 1
    target = trial.target_recruitment
    if target and target > 0:
        progress = round((enrolled_count / target) * 100, 2)
    else:
        target = 0
        progress = 0.0
    
    top_screenings = db.query(ScreeningResult).filter_by(
        trial_id=trial_id, eligible=True
    ).order_by(ScreeningResult.match_percentage.desc()).limit(10).all()
    
    top_candidates = [{"patient_id": s.patient_id, "score": s.match_percentage} for s in top_screenings]
    
    rejected_screenings = db.query(ScreeningResult.criteria_snapshot).filter_by(trial_id=trial_id, verdict="REJECTED").limit(100).all()
    reasons_tally = {}
    
    for (snapshot,) in rejected_screenings:
        if not snapshot or "explanations" not in snapshot:
            continue
        for exp in snapshot["explanations"]:
            if not exp.get("passed"):
                # FIX: Uses .get("field") perfectly mapped from explainability.py
                field = exp.get("field", "Unknown")
                reasons_tally[field] = reasons_tally.get(field, 0) + 1
                
    top_reasons = [{"reason": k, "count": v} for k, v in sorted(reasons_tally.items(), key=lambda item: item[1], reverse=True)[:5]]
    
    return {
        "target": target,
        "screened": screened_count,
        "approved": approved_count,
        "needs_review": needs_review_count,
        "rejected": rejected_count,
        "enrolled": enrolled_count,
        "progress": progress,
        "top_exclusion_reasons": top_reasons,
        "top_candidates": top_candidates
    }