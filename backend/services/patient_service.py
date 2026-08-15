from sqlalchemy.orm import Session

from backend.schemas.patient_schema import PatientCreate, PatientUpdate
from backend.models.patient import (
    Patient,
    PatientVitals,
    PatientCondition,
    PatientAllergy,
)
from backend.utils.patient_id import generate_patient_id
from backend.services.duplicate_service import check_duplicate


def create_patient(
    db: Session,
    patient_data: PatientCreate,
    force: bool = False,
):
    """
    Create a new patient along with optional:
    - Vitals
    - Conditions
    - Allergies

    Consent is mandatory for registration.

    Duplicate checking is performed unless force=True.
    """

    # ---------------------------------------------------------
    # 1. CONSENT CHECK
    # ---------------------------------------------------------

    if patient_data.consent is not True:
        raise ValueError(
            "Patient consent is required for registration."
        )

    # ---------------------------------------------------------
    # 2. DUPLICATE CHECK
    # ---------------------------------------------------------

    if not force:
        dup_check = check_duplicate(
            db,
            patient_data.name,
            patient_data.dob,
            patient_data.phone,
        )

        if dup_check["duplicate"]:
            return {
                "is_duplicate": True,
                "details": dup_check,
                "patient": None,
            }

    # ---------------------------------------------------------
    # 3. GENERATE PATIENT ID
    # ---------------------------------------------------------

    patient_id = generate_patient_id(db)

    # ---------------------------------------------------------
    # 4. CREATE PATIENT
    # ---------------------------------------------------------

    db_patient = Patient(
        patient_id=patient_id,
        name=patient_data.name,
        gender=patient_data.gender,
        dob=patient_data.dob,
        location=patient_data.location,
        phone=patient_data.phone,
        blood_group=patient_data.blood_group,
        previous_surgery=patient_data.previous_surgery,
        smoking=patient_data.smoking,
        alcohol=patient_data.alcohol,
        consent=True,
    )

    db.add(db_patient)

    # ---------------------------------------------------------
    # 5. CREATE VITALS
    # ---------------------------------------------------------

    if patient_data.vitals is not None:
        vitals_dict = patient_data.vitals.model_dump(
            exclude_unset=True
        )

        db_vitals = PatientVitals(
            patient_id=patient_id,
            **vitals_dict,
        )

        db.add(db_vitals)

    # ---------------------------------------------------------
    # 6. CREATE CONDITIONS
    # ---------------------------------------------------------

    for cond in patient_data.conditions:
        db_condition = PatientCondition(
            patient_id=patient_id,
            **cond.model_dump(),
        )

        db.add(db_condition)

    # ---------------------------------------------------------
    # 7. CREATE ALLERGIES
    # ---------------------------------------------------------

    for allergy in patient_data.allergies:
        db_allergy = PatientAllergy(
            patient_id=patient_id,
            **allergy.model_dump(),
        )

        db.add(db_allergy)

    # ---------------------------------------------------------
    # 8. COMMIT EVERYTHING
    # ---------------------------------------------------------

    try:
        db.commit()
        db.refresh(db_patient)

    except Exception:
        db.rollback()
        raise

    # ---------------------------------------------------------
    # 9. RETURN RESULT
    # ---------------------------------------------------------

    return {
        "is_duplicate": False,
        "details": None,
        "patient": db_patient,
    }


def get_patient(
    db: Session,
    patient_id: str,
) -> Patient | None:
    """
    Retrieve a patient by patient ID.
    """

    return (
        db.query(Patient)
        .filter(Patient.patient_id == patient_id)
        .first()
    )


def update_patient(
    db: Session,
    patient_id: str,
    patient_data: PatientUpdate,
) -> Patient | None:
    """
    Update patient information.

    active_trial_id is intentionally not handled here.
    Trial enrollment changes should happen through
    dedicated enrollment routes.
    """

    patient = (
        db.query(Patient)
        .filter(Patient.patient_id == patient_id)
        .first()
    )

    if patient is None:
        return None

    update_data = patient_data.model_dump(
        exclude_unset=True
    )

    # ---------------------------------------------------------
    # UPDATE PATIENT FIELDS
    # ---------------------------------------------------------

    for field, value in update_data.items():
        setattr(patient, field, value)

    # ---------------------------------------------------------
    # SAVE CHANGES
    # ---------------------------------------------------------

    try:
        db.commit()
        db.refresh(patient)

    except Exception:
        db.rollback()
        raise

    return patient


def list_patients(
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> list[Patient]:
    """
    Return a paginated list of patients.
    """

    skip = max(skip, 0)
    limit = min(max(limit, 1), 100)

    return (
        db.query(Patient)
        .offset(skip)
        .limit(limit)
        .all()
    )