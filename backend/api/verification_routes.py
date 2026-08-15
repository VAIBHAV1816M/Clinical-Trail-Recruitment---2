from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import Optional
from backend.database.session import get_db
from backend.services.verification_service import verify_screening

router = APIRouter(prefix="/verification", tags=["Verification"])

@router.post("/{screening_id}/verify")
def verify_screening_route(
    screening_id: int, 
    verified_by: str = Query(...), 
    remarks: Optional[str] = Body(None, embed=True), 
    db: Session = Depends(get_db)
):
    try:
        return verify_screening(db, screening_id, verified_by, remarks=remarks)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{screening_id}/override")
def override_screening_verdict(
    screening_id: int, 
    verified_by: str = Query(...), 
    override_verdict: str = Body(..., embed=True), 
    remarks: Optional[str] = Body(None, embed=True), 
    db: Session = Depends(get_db)
):
    try:
        return verify_screening(db, screening_id, verified_by, remarks=remarks, override_verdict=override_verdict)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))