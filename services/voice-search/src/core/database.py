import logging
from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database
from redis import Redis

from src.core.config import settings

logger = logging.getLogger(__name__)

# MongoDB connection
_mongo_client: Optional[MongoClient] = None
_mongo_db: Optional[Database] = None

# Redis connection
_redis_client: Optional[Redis] = None

def get_mongo_client() -> MongoClient:
    """Get MongoDB client instance."""
    global _mongo_client
    
    if _mongo_client is None:
        try:
            logger.info("Connecting to MongoDB...")
            _mongo_client = MongoClient(settings.MONGO_URI)
            logger.info("Connected to MongoDB successfully")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    return _mongo_client

def get_mongo_db() -> Database:
    """Get MongoDB database instance."""
    global _mongo_db
    
    if _mongo_db is None:
        client = get_mongo_client()
        db_name = settings.MONGO_URI.split("/")[-1].split("?")[0]
        _mongo_db = client[db_name]
    
    return _mongo_db

def close_mongo_connection():
    """Close MongoDB connection."""
    global _mongo_client
    
    if _mongo_client is not None:
        logger.info("Closing MongoDB connection...")
        _mongo_client.close()
        _mongo_client = None
        logger.info("MongoDB connection closed")

def get_redis_client() -> Redis:
    """Get Redis client instance."""
    global _redis_client
    
    if _redis_client is None:
        try:
            logger.info("Connecting to Redis...")
            _redis_client = Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB,
                decode_responses=True,
            )
            # Test connection
            _redis_client.ping()
            logger.info("Connected to Redis successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise
    
    return _redis_client

def close_redis_connection():
    """Close Redis connection."""
    global _redis_client
    
    if _redis_client is not None:
        logger.info("Closing Redis connection...")
        _redis_client.close()
        _redis_client = None
        logger.info("Redis connection closed")
