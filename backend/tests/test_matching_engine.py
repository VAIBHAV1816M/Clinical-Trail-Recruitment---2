from datetime import date

from backend.matching.engine import flatten_patient_data
from backend.matching.hard_criteria import evaluate_hard_criteria
from backend.models.patient import Patient, PatientAllergy, PatientCondition
from backend.schemas.criterion_schema import Classification, CriterionResponse, DataType


def test_flatten_patient_data_extracts_condition_and_allergy_names():
    patient = Patient(
        patient_id="p1",
        name="Rahul",
        gender="Male",
        dob=date(1990, 1, 1),
        smoking=False,
        alcohol=False,
        consent=True,
    )
    patient.conditions = [
        PatientCondition(condition_name="Hypertension"),
        PatientCondition(condition_name="Diabetes"),
    ]
    patient.allergies = [PatientAllergy(allergen="Penicillin")]

    patient_data, _ = flatten_patient_data(patient)

    assert patient_data["conditions"] == ["Hypertension", "Diabetes"]
    assert patient_data["allergies"] == ["Penicillin"]
    assert "Hypertension" in patient_data["conditions"]
    assert "Penicillin" in patient_data["allergies"]


def test_hard_criteria_accepts_condition_names_from_patient_lists():
    patient_data = {"conditions": ["Hypertension", "Diabetes"]}
    criteria = [
        CriterionResponse(
            criterion_id=1,
            trial_id="trial-1",
            field="conditions",
            data_type=DataType.CATEGORICAL,
            classification=Classification.HARD,
            operator="INCLUDES",
            categorical_ideal="Hypertension",
        )
    ]

    passed, failures = evaluate_hard_criteria(patient_data, criteria)

    assert passed is True
    assert failures == []
