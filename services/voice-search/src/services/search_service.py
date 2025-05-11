import logging
import httpx
from typing import Dict, List, Any, Optional
import json

from src.core.config import settings
from src.core.exceptions import ServiceUnavailableException, BadRequestException
from src.core.database import get_redis_client

logger = logging.getLogger(__name__)

class SearchService:
    """Service for searching projects and users."""
    
    def __init__(self):
        self.auth_service_url = settings.AUTH_SERVICE_URL
        self.projects_service_url = settings.PROJECTS_SERVICE_URL
        self.redis = get_redis_client()
        self.cache_ttl = settings.REDIS_CACHE_TTL
    
    async def search_projects(
        self, 
        query: str, 
        category: Optional[str] = None,
        skills: Optional[List[str]] = None,
        budget_min: Optional[float] = None,
        budget_max: Optional[float] = None,
        page: int = 1,
        limit: int = 10,
        token: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Search for projects based on query and filters.
        
        Args:
            query: Search query
            category: Project category
            skills: Required skills
            budget_min: Minimum budget
            budget_max: Maximum budget
            page: Page number
            limit: Items per page
            token: JWT token
            
        Returns:
            Search results
        """
        try:
            # Check cache first
            cache_key = f"{settings.REDIS_PREFIX}projects:{query}:{category}:{skills}:{budget_min}:{budget_max}:{page}:{limit}"
            cached_result = self.redis.get(cache_key)
            
            if cached_result:
                logger.info(f"Cache hit for project search: {query}")
                return json.loads(cached_result)
            
            # Prepare request parameters
            params = {
                "search": query,
                "page": page,
                "limit": limit,
            }
            
            if category:
                params["category"] = category
            
            if skills:
                params["skills"] = ",".join(skills)
            
            if budget_min is not None:
                params["budget_min"] = budget_min
            
            if budget_max is not None:
                params["budget_max"] = budget_max
            
            # Prepare headers
            headers = {}
            if token:
                headers["Authorization"] = f"Bearer {token}"
            
            # Make request to projects service
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.projects_service_url}/api/projects",
                    params=params,
                    headers=headers,
                    timeout=10.0,
                )
                
                if response.status_code != 200:
                    logger.error(f"Projects service error: {response.status_code} - {response.text}")
                    raise ServiceUnavailableException(message="Failed to search projects")
                
                result = response.json()
                
                # Cache result
                self.redis.setex(
                    cache_key,
                    self.cache_ttl,
                    json.dumps(result),
                )
                
                return result
        
        except httpx.RequestError as e:
            logger.error(f"Projects service request error: {e}")
            raise ServiceUnavailableException(message="Projects service is unavailable")
        
        except Exception as e:
            logger.error(f"Project search error: {e}")
            raise BadRequestException(message=f"Project search failed: {str(e)}")
    
    async def search_users(
        self, 
        query: str, 
        role: Optional[str] = None,
        skills: Optional[List[str]] = None,
        page: int = 1,
        limit: int = 10,
        token: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Search for users based on query and filters.
        
        Args:
            query: Search query
            role: User role (client or freelancer)
            skills: User skills
            page: Page number
            limit: Items per page
            token: JWT token
            
        Returns:
            Search results
        """
        try:
            # Check cache first
            cache_key = f"{settings.REDIS_PREFIX}users:{query}:{role}:{skills}:{page}:{limit}"
            cached_result = self.redis.get(cache_key)
            
            if cached_result:
                logger.info(f"Cache hit for user search: {query}")
                return json.loads(cached_result)
            
            # Prepare request parameters
            params = {
                "search": query,
                "page": page,
                "limit": limit,
            }
            
            if role:
                params["role"] = role
            
            if skills:
                params["skills"] = ",".join(skills)
            
            # Prepare headers
            headers = {}
            if token:
                headers["Authorization"] = f"Bearer {token}"
            
            # Make request to auth service
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.auth_service_url}/api/auth/users/search",
                    params=params,
                    headers=headers,
                    timeout=10.0,
                )
                
                if response.status_code != 200:
                    logger.error(f"Auth service error: {response.status_code} - {response.text}")
                    raise ServiceUnavailableException(message="Failed to search users")
                
                result = response.json()
                
                # Cache result
                self.redis.setex(
                    cache_key,
                    self.cache_ttl,
                    json.dumps(result),
                )
                
                return result
        
        except httpx.RequestError as e:
            logger.error(f"Auth service request error: {e}")
            raise ServiceUnavailableException(message="Auth service is unavailable")
        
        except Exception as e:
            logger.error(f"User search error: {e}")
            raise BadRequestException(message=f"User search failed: {str(e)}")

# Create search service instance
search_service = SearchService()
