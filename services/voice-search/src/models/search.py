from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class VoiceSearchRequest(BaseModel):
    """Voice search request model."""
    
    search_type: str = Field(..., description="Type of search (projects, users)")
    category: Optional[str] = Field(None, description="Project category")
    skills: Optional[List[str]] = Field(None, description="Required skills")
    budget_min: Optional[float] = Field(None, description="Minimum budget")
    budget_max: Optional[float] = Field(None, description="Maximum budget")
    role: Optional[str] = Field(None, description="User role (client or freelancer)")
    page: int = Field(1, description="Page number")
    limit: int = Field(10, description="Items per page")

class TextSearchRequest(BaseModel):
    """Text search request model."""
    
    query: str = Field(..., description="Search query")
    search_type: str = Field(..., description="Type of search (projects, users)")
    category: Optional[str] = Field(None, description="Project category")
    skills: Optional[List[str]] = Field(None, description="Required skills")
    budget_min: Optional[float] = Field(None, description="Minimum budget")
    budget_max: Optional[float] = Field(None, description="Maximum budget")
    role: Optional[str] = Field(None, description="User role (client or freelancer)")
    page: int = Field(1, description="Page number")
    limit: int = Field(10, description="Items per page")

class SearchHistoryEntry(BaseModel):
    """Search history entry model."""
    
    id: str = Field(..., alias="_id")
    user_id: str = Field(..., alias="userId")
    query: str
    search_type: str = Field(..., alias="searchType")
    filters: Dict[str, Any] = Field(default_factory=dict)
    results_count: int = Field(..., alias="resultsCount")
    source: str
    created_at: datetime = Field(..., alias="createdAt")
    
    class Config:
        allow_population_by_field_name = True

class PopularSearch(BaseModel):
    """Popular search model."""
    
    query: str
    count: int
    last_used: datetime = Field(..., alias="lastUsed")
    
    class Config:
        allow_population_by_field_name = True

class SearchResponse(BaseModel):
    """Search response model."""
    
    success: bool = True
    message: str = "Search successful"
    data: Dict[str, Any]
