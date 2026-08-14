from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any, Union
from datetime import datetime

class ScreeningResultResponse(BaseModel):
    screening_id: int
    patient_id: str
    trial_id: str
    vitals_id: Optional[int] = None
    match_percentage: float
    verdict: str
    eligible: bool
    criteria_snapshot: Optional[Dict[str, Any]] = None
    screened_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CandidateResult(BaseModel):
    patient_id: str
    patient_name: str
    match_percentage: float
    verdict: str
    gaps: List[str] = []

class MatchResponse(BaseModel):
    # Wraps either a single result (Mode 1) or a list of candidates (Modes 2/3)
    data: Union[ScreeningResultResponse, List[CandidateResult]]