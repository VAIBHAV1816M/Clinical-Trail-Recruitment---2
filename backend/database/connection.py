import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:password@localhost:5432/clinical_trials"
)

# pool_pre_ping=True added to handle idle/stale connections seamlessly
engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)

# Base class for all ORM models
Base = declarative_base()