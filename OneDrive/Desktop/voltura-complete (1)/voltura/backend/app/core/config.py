from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Single source of truth for all configuration. Values are loaded from
    environment variables / .env file — never hardcoded, never committed.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- App ---
    APP_NAME: str = "Voltura Electricity Management API"
    APP_ENV: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = True

    # --- Database ---
    DATABASE_URL: str
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_ECHO: bool = False

    # --- JWT Auth ---
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    RESET_TOKEN_EXPIRE_MINUTES: int = 30

    # --- CORS ---
    CORS_ORIGINS: str = "http://localhost:5173"
    FRONTEND_URL: str = "http://localhost:5173"

    # --- File uploads ---
    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_TEMP_DIR: str = "/tmp/voltura_uploads"

    # --- Rate limiting ---
    RATE_LIMIT_LOGIN: str = "5/minute"

    # --- Logging ---
    LOG_LEVEL: str = "INFO"
    LOG_JSON: bool = True

    # --- Super admin seed ---
    SUPERADMIN_EMAIL: str = "superadmin@voltura.com"
    SUPERADMIN_PASSWORD: str = "ChangeMe123!"
    SUPERADMIN_NAME: str = "Super Admin"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance — env is read once per process."""
    return Settings()


settings = get_settings()
