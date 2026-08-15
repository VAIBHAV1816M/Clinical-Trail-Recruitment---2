from typing import List, Dict, Any

def generate_explanations(hard_failures: List[Dict[str, Any]], soft_contributions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Translates mathematical contributions and failures into human-readable, 
    frontend-friendly dictionary objects.
    """
    explanations = []
    
    # Format hard failures
    for failure in hard_failures:
        explanations.append({
            "field": failure["field"],
            "type": "HARD",
            "passed": False,
            "message": failure["reason"]
        })
        
    # Format soft contributions
    for soft in soft_contributions:
        explanations.append({
            "field": soft["field"],
            "type": "SOFT",
            "passed": True,  # Soft criteria don't strictly "fail"
            "score": soft["contribution"],
            "max_score": soft["max_possible"],
            "message": f"Contributed {soft['contribution']}/{soft['max_possible']} to overall score."
        })
        
    return explanations