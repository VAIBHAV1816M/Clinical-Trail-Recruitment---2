from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from database.connection import Base

class Verification(Base):
    __tablename__ = "verifications"
    
    verification_id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String, ForeignKey("patients.patient_id"), nullable=False, index=True)
    trial_id = Column(String, ForeignKey("trials.trial_id"), nullable=False, index=True)
    
    verified = Column(Boolean, nullable=False, default=False)
    verified_by = Column(String, nullable=True) 
    
    # Bug fix: Nullable, explicitly set when verified=True
    verified_at = Column(DateTime, nullable=True)
    
    remarks = Column(Text, nullable=True) 

    patient = relationship("Patient")
    trial = relationship("Trial")