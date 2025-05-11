import logging
import jwt
from fastapi import Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from src.core.config import settings
from src.core.exceptions import UnauthorizedException

logger = logging.getLogger(__name__)

# JWT security scheme
security = HTTPBearer()

class JWTBearer:
    """JWT bearer authentication."""
    
    async def __call__(
        self, 
        request: Request, 
        credentials: HTTPAuthorizationCredentials = Depends(security)
    ):
        """Validate JWT token."""
        if not credentials:
            raise UnauthorizedException(message="Invalid authentication credentials")
        
        if credentials.scheme != "Bearer":
            raise UnauthorizedException(message="Invalid authentication scheme")
        
        return self.verify_jwt(credentials.credentials)
    
    def verify_jwt(self, token: str) -> dict:
        """Verify JWT token."""
        try:
            # Decode JWT token
            payload = jwt.decode(
                token,
                settings.JWT_PUBLIC_KEY,
                algorithms=["RS256", "HS256"],  # Support both algorithms for development
                options={"verify_signature": False} if settings.ENVIRONMENT == "development" else None,
            )
            
            # Check required claims
            if not payload.get("id"):
                raise UnauthorizedException(message="Invalid token payload")
            
            return payload
        except jwt.ExpiredSignatureError:
            raise UnauthorizedException(message="Token has expired")
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid token: {e}")
            raise UnauthorizedException(message="Invalid token")
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            raise UnauthorizedException(message="Token verification failed")

# Create JWT bearer instance
jwt_auth = JWTBearer()
