from fastapi import APIRouter, Depends, HTTPException, Query, Body, status
from sqlalchemy.orm import Session
from typing import Optional
from backend.database.session import get_db
from backend.services.verification_service import verify_screening
from backend.models.user import User
from backend.api.auth_deps import get_optional_current_user

router = APIRouter(prefix="/verification", tags=["Verification"])

@router.post("/{screening_id}/verify")
def verify_screening_route(
    screening_id: int, 
    verified_by: str = Query("INVESTIGATOR"), 
    remarks: Optional[str] = Body(None, embed=True), 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    if current_user and current_user.role == "PATIENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Patients cannot perform screening verification."
        )
    actor_id = current_user.email if current_user else verified_by
    try:
        return verify_screening(db, screening_id, actor_id, remarks=remarks)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{screening_id}/override")
def override_screening_verdict(
    screening_id: int, 
    verified_by: str = Query("INVESTIGATOR"), 
    override_verdict: str = Body(..., embed=True), 
    remarks: Optional[str] = Body(None, embed=True), 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    if current_user and current_user.role == "PATIENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Patients cannot perform screening verdict override."
        )
    actor_id = current_user.email if current_user else verified_by
    try:
        return verify_screening(db, screening_id, actor_id, remarks=remarks, override_verdict=override_verdict)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))