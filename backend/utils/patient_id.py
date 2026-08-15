from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from sqlalchemy import text
from backend.models.patient import Patient

def generate_patient_id(db: Session) -> str:
    """
    Generates the next available patient ID (e.g., P000001).
    
    CONCURRENCY FLAG: To prevent race conditions during simultaneous batch uploads,
    this function issues an explicit table-level lock in Postgres before reading
    the MAX(patient_id). This ensures no two threads can generate the same ID 
    before committing. Alternatively, a native Postgres SEQUENCE could be used.
    """
    # Lock the table to prevent concurrent reads of the same MAX value
    db.execute(text("LOCK TABLE patients IN EXCLUSIVE MODE"))
    
    # Query MAX(patient_id) from patients
    max_id_str = db.query(func.max(Patient.patient_id)).scalar()
    
    if not max_id_str:
        # Empty-table case: default to P000001
        return "P000001"
        
    # Strip the 'P' prefix, cast to int, increment, zero-pad to 6 digits, re-prefix
    try:
        numeric_part = int(max_id_str.replace("P", ""))
        next_numeric = numeric_part + 1
        return f"P{next_numeric:06d}"
    except ValueError:
        # Fallback in case of unexpected string formats
        return "P000001"