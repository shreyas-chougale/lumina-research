from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Multi-Agent Research Paper Analysis System"
    VERSION: str = "0.1.0"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "research_papers_db"
    
    # ChromaDB
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_db"
    
    # Groq API
    GROQ_API_KEY: str = ""
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"
    
    # JWT Authentication
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Agent configurations
    MAX_ITERATIONS: int = 5
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"

settings = Settings()
