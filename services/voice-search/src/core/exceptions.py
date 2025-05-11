from typing import Any, Dict, Optional

class AppException(Exception):
    """Base exception class for application exceptions."""
    
    def __init__(
        self,
        status_code: int = 500,
        message: str = "An unexpected error occurred",
        error: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.status_code = status_code
        self.message = message
        self.error = error or self.__class__.__name__
        self.details = details
        super().__init__(self.message)

class BadRequestException(AppException):
    """Exception raised for bad request errors."""
    
    def __init__(
        self,
        message: str = "Bad request",
        error: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            status_code=400,
            message=message,
            error=error,
            details=details,
        )

class UnauthorizedException(AppException):
    """Exception raised for unauthorized access."""
    
    def __init__(
        self,
        message: str = "Unauthorized",
        error: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            status_code=401,
            message=message,
            error=error,
            details=details,
        )

class ForbiddenException(AppException):
    """Exception raised for forbidden access."""
    
    def __init__(
        self,
        message: str = "Forbidden",
        error: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            status_code=403,
            message=message,
            error=error,
            details=details,
        )

class NotFoundException(AppException):
    """Exception raised for resource not found."""
    
    def __init__(
        self,
        message: str = "Resource not found",
        error: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            status_code=404,
            message=message,
            error=error,
            details=details,
        )

class ConflictException(AppException):
    """Exception raised for resource conflicts."""
    
    def __init__(
        self,
        message: str = "Resource conflict",
        error: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            status_code=409,
            message=message,
            error=error,
            details=details,
        )

class ValidationException(AppException):
    """Exception raised for validation errors."""
    
    def __init__(
        self,
        message: str = "Validation error",
        error: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            status_code=422,
            message=message,
            error=error,
            details=details,
        )

class ServiceUnavailableException(AppException):
    """Exception raised when a service is unavailable."""
    
    def __init__(
        self,
        message: str = "Service unavailable",
        error: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            status_code=503,
            message=message,
            error=error,
            details=details,
        )
