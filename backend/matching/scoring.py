import math
from typing import List, Dict, Any

def calculate_gaussian_score(value: float, ideal: float, tolerance: float, weight: float) -> float:
    """
    Applies Gaussian scoring: score = weight * e^(-(value-ideal)^2 / (2*sigma^2))
    sigma is half the tolerance.
    """
    if tolerance == 0:
        return weight if value == ideal else 0.0
        
    sigma = tolerance / 2.0
    exponent = -((value - ideal) ** 2) / (2 * (sigma ** 2))
    return weight * math.exp(exponent)

def aggregate_scores(soft_contributions: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Sums individual criterion contributions and computes the final match percentage.
    """
    total_score = sum(c["contribution"] for c in soft_contributions)
    max_possible = sum(c["max_possible"] for c in soft_contributions)
    
    if max_possible == 0:
        # If a trial has 0 soft criteria (or 0 weight), passing hard criteria means a 100% match.
        return {
            "total_score": 0.0,
            "max_possible_score": 0.0,
            "match_percentage": 100.0
        }
        
    match_percentage = (total_score / max_possible) * 100.0
    
    return {
        "total_score": total_score,
        "max_possible_score": max_possible,
        "match_percentage": round(match_percentage, 2)
    }