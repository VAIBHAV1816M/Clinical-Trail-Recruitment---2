# Tunable thresholds for the hackathon
THRESHOLD_APPROVED = 90.0
THRESHOLD_NEEDS_REVIEW = 70.0

def determine_verdict(match_percentage: float, hard_passed: bool) -> str:
    """
    Maps a match percentage to a discrete triage bucket.
    """
    if not hard_passed:
        return "REJECTED"
        
    if match_percentage >= THRESHOLD_APPROVED:
        return "APPROVED"
        
    if match_percentage >= THRESHOLD_NEEDS_REVIEW:
        return "NEEDS_REVIEW"
        
    return "REJECTED"