"""Core application configuration and settings."""
from typing import List, Union, Optional
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application Info
    PROJECT_NAME: str = "Smart Tablekeeper"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = "AI-powered restaurant reservation, discovery, and intelligence platform"
    ENVIRONMENT: str = "development"
    API_V1_PREFIX: str = "/api/v1"

    # Server Configuration
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]

    # Firebase Configuration
    FIREBASE_PROJECT_ID: str = "smart-tablekeeper"
    FIREBASE_CREDENTIALS_PATH: str = ""
    FIREBASE_EMULATOR_HOST: str = ""
    FIRESTORE_DATABASE: str = "(default)"

    # Redis Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: str = "redis://localhost:6379/0"

    # Gemini AI Configuration
    GEMINI_API_KEY: str = ""

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
