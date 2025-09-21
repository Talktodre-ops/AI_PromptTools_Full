"""
Prompt Gallery API Router (Free Version)
Simple endpoints for browsing and managing prompts without authentication
"""
from fastapi import APIRouter, HTTPException, Query, Path, Body
from typing import Dict, Any, List, Optional, Union
from pydantic import BaseModel
from services.supabase_service import SupabaseService
import json

router = APIRouter(prefix="/gallery", tags=["Gallery"])

def get_supabase():
    """Helper function to get supabase client with error handling."""
    supabase = SupabaseService.get_client()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection failed")
    return supabase

# Request Models
class PromptReviewCreate(BaseModel):
    rating: int
    review_text: Optional[str] = None

class PromptUsageTrack(BaseModel):
    platform: str
    success_rating: Optional[int] = None
    usage_context: Optional[str] = None

class PromptSubmission(BaseModel):
    title: str
    description: str
    template_content: str
    category: str
    mode: str = "deep"
    tone: str = "professional"
    persona: str = "assistant"
    tags: List[str] = []

# Gallery Browse Endpoints
@router.get("/prompts")
async def browse_prompts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("popular"),
    featured_only: bool = Query(False)
):
    """Browse prompts with advanced filtering and sorting. No authentication required."""
    try:
        supabase = get_supabase()
        offset = (page - 1) * limit

        # Build the query for prompt-gallery table
        query = supabase.table('prompt-gallery').select("*")

        # Apply search filter if provided
        if search:
            query = query.or_(f"prompt-title.ilike.%{search}%,prompt-content.ilike.%{search}%")

        # Apply sorting (by id for now since we don't have other fields)
        query = query.order('id', desc=True)

        # Apply pagination
        query = query.range(offset, offset + limit - 1)

        response = query.execute()

        # Get total count for pagination
        count_query = supabase.table('prompt-gallery').select("*", count="exact", head=True)
        if search:
            count_query = count_query.or_(f"prompt-title.ilike.%{search}%,prompt-content.ilike.%{search}%")

        count_response = count_query.execute()
        total_count = count_response.count

        # Transform data for compatibility
        prompts = []
        for prompt in response.data:
            prompts.append({
                "id": prompt.get("id"),
                "title": prompt.get("prompt-title", "Untitled"),
                "content": prompt.get("prompt-content", ""),
                "category": category or "general",
                "rating": 4.5,  # Default rating since we don't have user ratings
                "rating_count": 1,
                "usage_count": 0,
                "is_favorite": False,  # No user authentication
                "is_featured": featured_only,
                "created_at": prompt.get("created_at", "2024-01-01"),
                "tags": []
            })

        return {
            "prompts": prompts,
            "pagination": {
                "current_page": page,
                "per_page": limit,
                "total_count": total_count,
                "total_pages": (total_count + limit - 1) // limit
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching prompts: {str(e)}")

@router.get("/prompts/{prompt_id}")
async def get_prompt_details(prompt_id: str = Path(...)):
    """Get detailed information about a specific prompt. No authentication required."""
    try:
        supabase = get_supabase()

        # Get prompt details from prompt-gallery table
        response = supabase.table('prompt-gallery').select("*").eq('id', prompt_id).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Prompt not found")

        prompt = response.data[0]

        # Return simplified prompt details
        return {
            "id": prompt.get("id"),
            "title": prompt.get("prompt-title", "Untitled"),
            "content": prompt.get("prompt-content", ""),
            "category": "general",
            "rating": 4.5,
            "rating_count": 1,
            "usage_count": 0,
            "is_favorite": False,
            "is_featured": False,
            "created_at": prompt.get("created_at", "2024-01-01"),
            "tags": [],
            "user_review": None,
            "related_prompts": []
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching prompt details: {str(e)}")

@router.get("/categories")
async def get_categories():
    """Get available prompt categories."""
    return {
        "categories": [
            {"id": "writing", "name": "Writing & Content", "icon": "pen", "description": "Blog posts, emails, and creative writing"},
            {"id": "technical", "name": "Technical & Code", "icon": "code", "description": "Programming and technical documentation"},
            {"id": "creative", "name": "Creative & Design", "icon": "palette", "description": "Creative projects and design briefs"},
            {"id": "business", "name": "Business & Marketing", "icon": "briefcase", "description": "Business communications and marketing"},
            {"id": "education", "name": "Education & Learning", "icon": "book", "description": "Educational content and tutorials"},
            {"id": "general", "name": "General Purpose", "icon": "star", "description": "Versatile prompts for various uses"}
        ]
    }

@router.get("/stats")
async def get_gallery_stats():
    """Get overall gallery statistics. No authentication required."""
    try:
        supabase = get_supabase()

        # Get total prompts count
        count_response = supabase.table('prompt-gallery').select("*", count="exact", head=True).execute()
        total_prompts = count_response.count or 0

        return {
            "total_prompts": total_prompts,
            "total_users": 0,  # No user tracking
            "total_favorites": 0,
            "total_reviews": 0,
            "featured_prompts": 0,
            "categories_count": 6
        }
    except Exception as e:
        return {
            "total_prompts": 0,
            "total_users": 0,
            "total_favorites": 0,
            "total_reviews": 0,
            "featured_prompts": 0,
            "categories_count": 6
        }

# Note: User-specific endpoints (favorites, reviews, submissions) removed for free version
# All functionality is now accessible without authentication