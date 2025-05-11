from fastapi import APIRouter, Depends, File, Form, UploadFile, Query
from typing import List, Optional, Dict, Any
import logging

from src.core.auth import jwt_auth
from src.models.search import (
    VoiceSearchRequest,
    TextSearchRequest,
    SearchResponse,
    SearchHistoryEntry,
    PopularSearch,
)
from src.services.speech_recognition import speech_recognition_service
from src.services.search_service import search_service
from src.services.search_history_service import search_history_service

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/voice-search", response_model=SearchResponse)
async def voice_search(
    search_type: str = Form(...),
    audio_file: UploadFile = File(...),
    category: Optional[str] = Form(None),
    skills: Optional[str] = Form(None),
    budget_min: Optional[float] = Form(None),
    budget_max: Optional[float] = Form(None),
    role: Optional[str] = Form(None),
    page: int = Form(1),
    limit: int = Form(10),
    user: Dict[str, Any] = Depends(jwt_auth),
):
    """
    Perform a search using voice input.
    
    - **search_type**: Type of search (projects, users)
    - **audio_file**: Audio file containing the search query
    - **category**: Project category (for project search)
    - **skills**: Required skills (comma-separated)
    - **budget_min**: Minimum budget (for project search)
    - **budget_max**: Maximum budget (for project search)
    - **role**: User role (for user search)
    - **page**: Page number
    - **limit**: Items per page
    """
    # Get file extension
    file_extension = audio_file.filename.split(".")[-1].lower()
    
    # Recognize speech
    query = speech_recognition_service.recognize_from_file(
        audio_file.file, file_extension
    )
    
    logger.info(f"Recognized query: {query}")
    
    # Parse skills
    skills_list = None
    if skills:
        skills_list = [s.strip() for s in skills.split(",") if s.strip()]
    
    # Perform search
    if search_type == "projects":
        results = await search_service.search_projects(
            query=query,
            category=category,
            skills=skills_list,
            budget_min=budget_min,
            budget_max=budget_max,
            page=page,
            limit=limit,
            token=user.get("token"),
        )
    elif search_type == "users":
        results = await search_service.search_users(
            query=query,
            role=role,
            skills=skills_list,
            page=page,
            limit=limit,
            token=user.get("token"),
        )
    else:
        results = {"error": "Invalid search type"}
    
    # Save search history
    filters = {
        "category": category,
        "skills": skills_list,
        "budget_min": budget_min,
        "budget_max": budget_max,
        "role": role,
        "page": page,
        "limit": limit,
    }
    
    results_count = results.get("data", {}).get("pagination", {}).get("total", 0)
    
    await search_history_service.add_search(
        user_id=user["id"],
        query=query,
        search_type=search_type,
        filters=filters,
        results_count=results_count,
        source="voice",
    )
    
    return {
        "success": True,
        "message": "Voice search successful",
        "data": {
            "query": query,
            "results": results,
        },
    }

@router.post("/text-search", response_model=SearchResponse)
async def text_search(
    request: TextSearchRequest,
    user: Dict[str, Any] = Depends(jwt_auth),
):
    """
    Perform a search using text input.
    
    - **query**: Search query
    - **search_type**: Type of search (projects, users)
    - **category**: Project category (for project search)
    - **skills**: Required skills
    - **budget_min**: Minimum budget (for project search)
    - **budget_max**: Maximum budget (for project search)
    - **role**: User role (for user search)
    - **page**: Page number
    - **limit**: Items per page
    """
    # Perform search
    if request.search_type == "projects":
        results = await search_service.search_projects(
            query=request.query,
            category=request.category,
            skills=request.skills,
            budget_min=request.budget_min,
            budget_max=request.budget_max,
            page=request.page,
            limit=request.limit,
            token=user.get("token"),
        )
    elif request.search_type == "users":
        results = await search_service.search_users(
            query=request.query,
            role=request.role,
            skills=request.skills,
            page=request.page,
            limit=request.limit,
            token=user.get("token"),
        )
    else:
        results = {"error": "Invalid search type"}
    
    # Save search history
    filters = {
        "category": request.category,
        "skills": request.skills,
        "budget_min": request.budget_min,
        "budget_max": request.budget_max,
        "role": request.role,
        "page": request.page,
        "limit": request.limit,
    }
    
    results_count = results.get("data", {}).get("pagination", {}).get("total", 0)
    
    await search_history_service.add_search(
        user_id=user["id"],
        query=request.query,
        search_type=request.search_type,
        filters=filters,
        results_count=results_count,
        source="text",
    )
    
    return {
        "success": True,
        "message": "Text search successful",
        "data": {
            "query": request.query,
            "results": results,
        },
    }

@router.get("/history", response_model=Dict[str, Any])
async def get_search_history(
    limit: int = Query(10, ge=1, le=100),
    skip: int = Query(0, ge=0),
    search_type: Optional[str] = Query(None),
    user: Dict[str, Any] = Depends(jwt_auth),
):
    """
    Get search history for the current user.
    
    - **limit**: Maximum number of entries
    - **skip**: Number of entries to skip
    - **search_type**: Type of search (projects, users)
    """
    history = await search_history_service.get_user_history(
        user_id=user["id"],
        limit=limit,
        skip=skip,
        search_type=search_type,
    )
    
    return {
        "success": True,
        "message": "Search history retrieved successfully",
        "data": {
            "history": history,
            "pagination": {
                "limit": limit,
                "skip": skip,
                "total": len(history),  # This is not accurate for the total count
            },
        },
    }

@router.get("/popular", response_model=Dict[str, Any])
async def get_popular_searches(
    limit: int = Query(10, ge=1, le=100),
    search_type: Optional[str] = Query(None),
    days: int = Query(7, ge=1, le=30),
    user: Dict[str, Any] = Depends(jwt_auth),
):
    """
    Get popular searches.
    
    - **limit**: Maximum number of entries
    - **search_type**: Type of search (projects, users)
    - **days**: Number of days to look back
    """
    popular = await search_history_service.get_popular_searches(
        limit=limit,
        search_type=search_type,
        days=days,
    )
    
    return {
        "success": True,
        "message": "Popular searches retrieved successfully",
        "data": {
            "popular": popular,
        },
    }
