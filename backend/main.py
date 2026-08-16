from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.connection import engine, Base
import backend.models  # Crucial: ensures Base.metadata knows about all your tables before creating them

# --- HACKATHON SHORTCUT ---
# Instantly builds any missing tables in PostgreSQL on startup. No Alembic needed.
Base.metadata.create_all(bind=engine)
# --------------------------

# Import all routers
from backend.api.patient_routes import router as patient_router
from backend.api.trial_routes import router as trial_router
from backend.api.matching_routes import router as matching_router
from backend.api.enrollment_routes import router as enrollment_router
from backend.api.dashboard_routes import router as dashboard_router
from backend.api.verification_routes import router as verification_router
from backend.api.notification_routes import router as notification_router
from backend.api.export_routes import router as export_router

app = FastAPI(
    title="Clinical Trial Recruitment API",
    description="Hackathon Backend System"
)

# FIX: CORS wildcard + credentials is illegal. 
# Explicitly allowing standard frontend dev server ports instead.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes
app.include_router(patient_router)
app.include_router(trial_router)
app.include_router(matching_router)
app.include_router(enrollment_router)
app.include_router(dashboard_router)
app.include_router(verification_router)
app.include_router(notification_router)
app.include_router(export_router)

# Basic Health Check
@app.get("/")
def health_check():
    return {"status": "API is running, routers registered, CORS is secure, and tables are built!"}