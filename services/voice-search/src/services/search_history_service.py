import logging
from datetime import datetime
from typing import Dict, List, Any, Optional

from src.core.database import get_mongo_db

logger = logging.getLogger(__name__)

class SearchHistoryService:
    """Service for managing search history."""
    
    def __init__(self):
        self.db = get_mongo_db()
        self.collection = self.db["search_history"]
    
    async def add_search(
        self,
        user_id: str,
        query: str,
        search_type: str,
        filters: Optional[Dict[str, Any]] = None,
        results_count: int = 0,
        source: str = "voice",
    ) -> Dict[str, Any]:
        """
        Add a search to the history.
        
        Args:
            user_id: User ID
            query: Search query
            search_type: Type of search (projects, users)
            filters: Search filters
            results_count: Number of results
            source: Search source (voice, text)
            
        Returns:
            Created search history entry
        """
        search_entry = {
            "userId": user_id,
            "query": query,
            "searchType": search_type,
            "filters": filters or {},
            "resultsCount": results_count,
            "source": source,
            "createdAt": datetime.utcnow(),
        }
        
        result = self.collection.insert_one(search_entry)
        search_entry["_id"] = str(result.inserted_id)
        
        logger.info(f"Added search history for user {user_id}: {query}")
        
        return search_entry
    
    async def get_user_history(
        self,
        user_id: str,
        limit: int = 10,
        skip: int = 0,
        search_type: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Get search history for a user.
        
        Args:
            user_id: User ID
            limit: Maximum number of entries
            skip: Number of entries to skip
            search_type: Type of search (projects, users)
            
        Returns:
            List of search history entries
        """
        query = {"userId": user_id}
        
        if search_type:
            query["searchType"] = search_type
        
        cursor = self.collection.find(query).sort("createdAt", -1).skip(skip).limit(limit)
        
        history = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            history.append(doc)
        
        return history
    
    async def get_popular_searches(
        self,
        limit: int = 10,
        search_type: Optional[str] = None,
        days: int = 7,
    ) -> List[Dict[str, Any]]:
        """
        Get popular searches.
        
        Args:
            limit: Maximum number of entries
            search_type: Type of search (projects, users)
            days: Number of days to look back
            
        Returns:
            List of popular search queries
        """
        match_stage = {
            "createdAt": {
                "$gte": datetime.utcnow().replace(
                    hour=0, minute=0, second=0, microsecond=0
                ) - datetime.timedelta(days=days)
            }
        }
        
        if search_type:
            match_stage["searchType"] = search_type
        
        pipeline = [
            {"$match": match_stage},
            {"$group": {
                "_id": "$query",
                "count": {"$sum": 1},
                "lastUsed": {"$max": "$createdAt"}
            }},
            {"$sort": {"count": -1, "lastUsed": -1}},
            {"$limit": limit},
            {"$project": {
                "_id": 0,
                "query": "$_id",
                "count": 1,
                "lastUsed": 1
            }}
        ]
        
        cursor = self.collection.aggregate(pipeline)
        
        popular_searches = []
        async for doc in cursor:
            popular_searches.append(doc)
        
        return popular_searches

# Create search history service instance
search_history_service = SearchHistoryService()
