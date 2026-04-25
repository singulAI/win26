from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Grupo Win API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://grupowin:SENHA@grupowin-postgres:5432/grupowin"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    # Redis
    REDIS_URL: str = "redis://grupowin-redis:6379/2"

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 horas

    # Siprov ERP (externo)
    SIPROV_BASE_URL: str = ""
    SIPROV_TOKEN: str = ""
    SIPROV_TIMEOUT: int = 30

    # Assist24 (externo)
    ASSIST24_BASE_URL: str = ""
    ASSIST24_TOKEN: str = ""

    # n8n webhook base
    N8N_WEBHOOK_BASE: str = "http://grupowin-n8n:5678/webhook"
    N8N_API_KEY: str = ""

    # AI — suporta Ollama local (gratis!) ou OpenAI
    # Para Ollama: AI_BASE_URL=http://host.docker.internal:11434/v1, AI_API_KEY=ollama
    # Para OpenAI: AI_BASE_URL=https://api.openai.com/v1, AI_API_KEY=sk-...
    AI_API_KEY: str = "ollama"
    AI_BASE_URL: str = "http://host.docker.internal:11434/v1"
    AI_MODEL: str = "llama3.2"

    # CORS
    CORS_ORIGINS: list[str] = ["https://oi.grupowin.site", "https://sos.grupowin.site", "https://metrics.grupowin.site"]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
