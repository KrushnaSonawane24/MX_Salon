from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URI: str = ""
    JWT_SECRET: str = ""
    JWT_EXPIRE_MINUTES: int = 1440
    REDIS_URL: str = ""
    ALLOWED_ORIGINS: str = "*"
    ENV: str = "development"

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
