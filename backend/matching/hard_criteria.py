from typing import List, Dict, Tuple, Any
from backend.schemas.criterion_schema import CriterionResponse, DataType

def evaluate_hard_criteria(patient_data: Dict[str, Any], criteria: List[CriterionResponse]) -> Tuple[bool, List[Dict[str, Any]]]:
    """
    Evaluates strictly required (HARD) criteria.
    Returns (True, []) if all pass, or (False, [failures]) if any fail.
    Collects ALL failures for a complete rejection explanation.
    """
    failures = []
    
    for crit in criteria:
        val = patient_data.get(crit.field)
        
        # Missing required data is an immediate hard failure
        if val is None:
            failures.append({"field": crit.field, "reason": f"Missing required patient data for '{crit.field}'"})
            continue
            
        if crit.data_type == DataType.NUMERIC:
            if not (crit.numeric_min <= val <= crit.numeric_max):
                failures.append({"field": crit.field, "reason": f"Value {val} is outside strictly required range {crit.numeric_min}-{crit.numeric_max}"})
                
        elif crit.data_type == DataType.CATEGORICAL:
            if crit.operator == "INCLUDES" and isinstance(val, list):
                if crit.categorical_ideal not in val:
                    failures.append({"field": crit.field, "reason": f"Required condition/categorical '{crit.categorical_ideal}' not found in patient history"})
            else:
                if val != crit.categorical_ideal:
                    failures.append({"field": crit.field, "reason": f"Value '{val}' does not match required '{crit.categorical_ideal}'"})
                    
        elif crit.data_type == DataType.BOOLEAN:
            if val != crit.boolean_ideal:
                failures.append({"field": crit.field, "reason": f"Required {crit.boolean_ideal}, but patient has {val}"})
                
    if failures:
        return False, failures
        
    return True, []