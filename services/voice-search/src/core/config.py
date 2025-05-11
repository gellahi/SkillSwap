import os
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    # Application
    APP_NAME: str = Field(default="voice-search-service")
    APP_VERSION: str = Field(default="1.0.0")
    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = Field(default=True)
    LOG_LEVEL: str = Field(default="INFO")
    
    # Server
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=3006)
    
    # MongoDB
    MONGO_URI: str = Field(default="mongodb://localhost:27017/skillswap_voice_search")
    
    # Redis
    REDIS_HOST: str = Field(default="localhost")
    REDIS_PORT: int = Field(default=6379)
    REDIS_DB: int = Field(default=1)
    REDIS_PREFIX: str = Field(default="skillswap_voice_search:")
    REDIS_CACHE_TTL: int = Field(default=3600)
    
    # Services
    AUTH_SERVICE_URL: str = Field(default="http://localhost:3001")
    PROJECTS_SERVICE_URL: str = Field(default="http://localhost:3002")
    
    # JWT
    JWT_PUBLIC_KEY: str = Field(default="skillswap_jwt_public_key_development")
    
    # Speech Recognition
    SPEECH_RECOGNITION_LANGUAGE: str = Field(default="en-US")
    MAX_AUDIO_SIZE_MB: int = Field(default=10)
    AUDIO_SAMPLE_RATE: int = Field(default=16000)
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()
