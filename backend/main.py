from fastapi import FastAPI
from database.connection import engine, Base
import models  # This loads all your tables

# --- HACKATHON SHORTCUT ---
Base.metadata.create_all(bind=engine)
# --------------------------

app = FastAPI(
    title="Clinical Trial Recruitment API",
    description="Hackathon Backend System"
)

@app.get("/")
def health_check():
    return {"status": "Database built successfully and API is running!"}