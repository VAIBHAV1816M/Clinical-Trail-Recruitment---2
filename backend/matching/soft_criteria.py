from typing import List, Dict, Any
from backend.schemas.criterion_schema import CriterionResponse, DataType
from backend.matching.scoring import calculate_gaussian_score

def evaluate_soft_criteria(patient_data: Dict[str, Any], criteria: List[CriterionResponse]) -> List[Dict[str, Any]]:
    """
    Evaluates preferential (SOFT) criteria, returning a score contribution for each.
    """
    contributions = []
    
    for crit in criteria:
        val = patient_data.get(crit.field)
        
        # FIX: Explicit is not None check so a 0.0 weight isn't overridden by 'or 1.0'
        weight = crit.weight if crit.weight is not None else 1.0
        
        contribution = 0.0
        
        if val is not None:
            if crit.data_type == DataType.NUMERIC:
                contribution = calculate_gaussian_score(
                    value=float(val), 
                    ideal=crit.numeric_ideal, 
                    tolerance=crit.numeric_tolerance, 
                    weight=weight
                )
            elif crit.data_type == DataType.CATEGORICAL:
                if crit.operator == "INCLUDES" and isinstance(val, list):
                    if crit.categorical_ideal in val:
                        contribution = weight
                else:
                    if val == crit.categorical_ideal:
                        contribution = weight
            elif crit.data_type == DataType.BOOLEAN:
                if val == crit.boolean_ideal:
                    contribution = weight
                    
        contributions.append({
            "field": crit.field,
            "contribution": round(contribution, 2),
            "max_possible": weight
        })
        
    return contributions