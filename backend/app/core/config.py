from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = 'Food Freshness API'
    MODEL_PATH: str = '../ml/models/best_finetuned_model.keras'
    
    SECRET_KEY: str = 'your_secret_key_here'
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    MONGODB_URI: str = 'mongodb://localhost:27017'
    DB_NAME: str = 'food_freshness_db'

    GEMINI_API_KEY: Optional[str] = None
    GOOGLE_CLIENT_ID: Optional[str] = None
    SMTP_SERVER: Optional[str] = None
    SMTP_PORT: Optional[int] = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None

    model_config = SettingsConfigDict(env_file='../.env', env_file_encoding='utf-8', extra='ignore')

settings = Settings()
