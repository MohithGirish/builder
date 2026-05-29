"""
config.py — Application settings for the Builder AI Matchmaking Microservice.

Defines the Settings class (pydantic-settings BaseSettings) that reads
configuration from environment variables or a .env file: app environment,
port, log level, allowed CORS origins (comma-separated string converted to
a list), and an internal API key. The get_settings() function is cached with
lru_cache to return a singleton Settings instance.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    app_port: int = 8000
    log_level: str = "info"
    allowed_origins: str = "http://localhost:3000,http://localhost:5000"
    internal_api_key: str = "dev_internal_secret"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()
