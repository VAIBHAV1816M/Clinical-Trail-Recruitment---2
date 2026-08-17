from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    DATABASE_URL: str
    LLM_API_KEY: str
    LLM_MODEL: str = "llama-3.1-8b-instant"
    UPLOAD_DIRECTORY: str = "./uploads"
    ENVIRONMENT: str = "development"

    # Read directly from backend/.env
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()