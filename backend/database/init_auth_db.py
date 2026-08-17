from sqlalchemy import text
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import logging

from backend.database.connection import engine, Base
import backend.models
from backend.models.user import User
from backend.models.researcher import Researcher
from backend.models.patient import Patient
from backend.models.trial import Trial
from backend.utils.security import hash_password

logger = logging.getLogger(__name__)

def upgrade_schema():
    """Safely build missing tables and extend existing tables with auth columns."""
    # 1. Create any missing tables (users, researchers, etc.)
    Base.metadata.create_all(bind=engine)

    # 2. Safely add foreign key columns to existing tables if not present
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE patients ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);"))
            conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_patients_user_id ON patients(user_id) WHERE user_id IS NOT NULL;"))
        except Exception as e:
            logger.warning(f"Note on patients table column check: {e}")

        try:
            conn.execute(text("ALTER TABLE trials ADD COLUMN IF NOT EXISTS researcher_id INTEGER REFERENCES researchers(id);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_trials_researcher_id ON trials(researcher_id);"))
        except Exception as e:
            logger.warning(f"Note on trials table column check: {e}")
        
        conn.commit()

def seed_auth_data(db: Session):
    """
    Seed initial demo researcher and patient accounts idempotently.
    Running multiple times will NOT duplicate or corrupt data.
    """
    # 1. Seed Demo Researcher: researcher@example.com / Researcher@123
    researcher_email = "researcher@example.com"
    existing_res_user = db.query(User).filter_by(email=researcher_email).first()
    
    if not existing_res_user:
        res_user = User(
            email=researcher_email,
            password_hash=hash_password("Researcher@123"),
            role="RESEARCHER",
            is_active=True
        )
        db.add(res_user)
        db.flush()

        res_profile = Researcher(
            user_id=res_user.id,
            name="Dr. Rachel Miller, MD",
            organization="Clinical Research Institute",
            designation="Principal Investigator",
            specialization="Endocrinology & Clinical Trials",
            contact="+1 (555) 234-5678"
        )
        db.add(res_profile)
        db.flush()
        logger.info("Demo researcher user created.")
    else:
        res_user = existing_res_user
        res_profile = db.query(Researcher).filter_by(user_id=res_user.id).first()

    # Link existing unassigned trials to the demo researcher
    if res_profile:
        trials_without_owner = db.query(Trial).filter(Trial.researcher_id.is_(None)).all()
        for t in trials_without_owner:
            t.researcher_id = res_profile.id
            logger.info(f"Assigned trial {t.trial_id} to researcher {res_profile.name}")

    # 2. Seed Demo Patient: patient@example.com / Patient@123
    patient_email = "patient@example.com"
    existing_pat_user = db.query(User).filter_by(email=patient_email).first()
    
    if not existing_pat_user:
        pat_user = User(
            email=patient_email,
            password_hash=hash_password("Patient@123"),
            role="PATIENT",
            is_active=True
        )
        db.add(pat_user)
        db.flush()
        logger.info("Demo patient user created.")
    else:
        pat_user = existing_pat_user

    # Link existing patient record (e.g. first patient in DB) to demo patient user
    linked_patient = db.query(Patient).filter_by(user_id=pat_user.id).first()
    if not linked_patient:
        # Find first available patient without user_id, or first patient
        candidate_patient = db.query(Patient).filter(Patient.user_id.is_(None)).first()
        if not candidate_patient:
            candidate_patient = db.query(Patient).first()
        
        if candidate_patient:
            candidate_patient.user_id = pat_user.id
            logger.info(f"Linked patient record {candidate_patient.patient_id} ({candidate_patient.name}) to {patient_email}")

    db.commit()

if __name__ == "__main__":
    upgrade_schema()
    from backend.database.session import SessionLocal
    with SessionLocal() as db:
        seed_auth_data(db)
    print("Database upgrade and authentication seeding complete!")
