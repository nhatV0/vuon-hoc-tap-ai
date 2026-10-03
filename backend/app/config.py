from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Trợ lý Hoa Hướng Dương & Khu Vườn Cảm Xúc"
    DATABASE_URL: str = "sqlite:///./garden.db"
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    AI_MODEL: str = "gemini-1.5-flash"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
