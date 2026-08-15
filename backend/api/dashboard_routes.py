from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.services.dashboard_service import get_dashboard_stats
from backend.schemas.dashboard_schema import DashboardStatsResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/trials/{trial_id}", response_model=DashboardStatsResponse)
def get_trial_dashboard(trial_id: str, db: Session = Depends(get_db)):
    try:
        return get_dashboard_stats(db, trial_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))