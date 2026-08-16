from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    LLM_API_KEY: str
    LLM_MODEL: str = "llama-3.1-8b-instant"
    UPLOAD_DIRECTORY: str = "./uploads"
    ENVIRONMENT: str = "development"

    # This tells Pydantic to read from the .env file in your backend folder
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()