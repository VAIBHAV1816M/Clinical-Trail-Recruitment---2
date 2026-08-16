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
    """Mode 3 shape: ranking PATIENTS against one known trial."""
    patient_id: str
    patient_name: str
    match_percentage: float
    verdict: str
    gaps: List[str] = []


class TrialCandidateResult(BaseModel):
    """
    Mode 2 shape: ranking TRIALS for one known patient. This is deliberately
    separate from CandidateResult - reusing that schema here would force every
    row to repeat the same patient_id/patient_name and give the frontend no
    way to tell which trial each score actually belongs to.
    """
    trial_id: str
    trial_name: str
    match_percentage: float
    verdict: str
    gaps: List[str] = []


class ScreenRequest(BaseModel):
    """Body for POST /matching/screen/ - the persisted screening endpoint."""
    patient_id: str
    trial_id: str


class MatchResponse(BaseModel):
    # Wraps either a single result (Mode 1, in-memory) or a list of candidates (Modes 2/3)
    data: Union[ScreeningResultResponse, List[CandidateResult], List[TrialCandidateResult]]