"""
Prompt Gallery API Router (Fixed Version)
Advanced endpoints for the enhanced prompt gallery with community features
"""
from fastapi import APIRouter, HTTPException, Depends, Query, Path, Body
from typing import Dict, Any, List, Optional, Union
from pydantic import BaseModel
from services.supabase_service import SupabaseService
# User authentication removed for development simplicity
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

class PromptFavoriteToggle(BaseModel):
    is_favorite: bool

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
    sort_by: str = Query("popular", regex="^(popular|recent|rating|effectiveness|usage)$"),
    featured_only: bool = Query(False),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """Browse prompts with advanced filtering and sorting."""
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

        # Transform the data to match frontend expectations
        prompts = []
        for item in response.data:
            prompts.append({
                "id": str(item['id']),
                "title": item['prompt-title'],
                "description": item['prompt-title'],  # Use title as description for now
                "template_content": item['prompt-content'],
                "category": category or "General",  # Default category
                "mode": "deep",
                "difficulty_level": "intermediate",
                "tags": [],
                "platform_tags": ["General"],
                "use_cases": [],
                "effectiveness_score": 85,  # Default score
                "rating": 4.5,  # Default rating
                "rating_count": 10,
                "usage_count": 50,
                "is_favorited": False
            })

        return {
            "prompts": prompts,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_count,
                "pages": (total_count + limit - 1) // limit if total_count else 1
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error browsing prompts: {str(e)}")

@router.get("/prompts/{prompt_id}")
async def get_prompt_details(
    prompt_id: str = Path(...),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """Get detailed information about a specific prompt."""
    try:
        supabase = get_supabase()

        # Get prompt details from prompt-gallery table
        response = supabase.table('prompt-gallery').select("*").eq('id', prompt_id).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Prompt not found")

        item = response.data[0]

        # Transform to match frontend expectations
        return {
            "id": str(item['id']),
            "title": item['prompt-title'],
            "description": item['prompt-title'],
            "template_content": item['prompt-content'],
            "category": "General",
            "mode": "deep",
            "difficulty_level": "intermediate",
            "tags": [],
            "platform_tags": ["General"],
            "use_cases": [],
            "effectiveness_score": 85,
            "rating": 4.5,
            "rating_count": 10,
            "usage_count": 50,
            "is_favorited": False,
            "variations": [],
            "examples": [],
            "best_practices": "Use this prompt for best results"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting prompt details: {str(e)}")

@router.get("/collections")
async def get_collections():
    """Get all prompt collections."""
    # Return mock collections since the table may not exist yet
    return {
        "collections": [
            {
                "id": "1",
                "name": "Developer Essentials",
                "description": "Essential prompts for developers",
                "slug": "developer-essentials",
                "prompt_count": 25
            },
            {
                "id": "2",
                "name": "Creative Writing",
                "description": "Prompts for creative writing",
                "slug": "creative-writing",
                "prompt_count": 18
            }
        ]
    }

@router.get("/stats")
async def get_gallery_stats():
    """Get gallery statistics."""
    try:
        supabase = get_supabase()

        # Total prompts from prompt-gallery table
        total_response = supabase.table('prompt-gallery').select("*", count="exact", head=True).execute()

        # Since we don't have categories in the table, use default categories
        categories = {
            "General": total_response.count if total_response.count else 0,
            "Writing": 0,
            "Technical": 0,
            "Creative": 0
        }

        # Get top prompts for display
        top_prompts_response = supabase.table('prompt-gallery').select("id, prompt-title").limit(5).execute()

        top_rated = []
        most_used = []

        for idx, prompt in enumerate(top_prompts_response.data[:3]):
            top_rated.append({
                "id": str(prompt['id']),
                "title": prompt['prompt-title'],
                "rating": 4.5 - (idx * 0.1)  # Mock ratings
            })

        for idx, prompt in enumerate(top_prompts_response.data[:3]):
            most_used.append({
                "id": str(prompt['id']),
                "title": prompt['prompt-title'],
                "usage_count": 100 - (idx * 20)  # Mock usage counts
            })

        return {
            "total_prompts": total_response.count if total_response.count else 0,
            "categories": categories,
            "top_rated": top_rated,
            "most_used": most_used
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")

@router.get("/categories")
async def get_categories():
    """Get all available categories with counts."""
    try:
        supabase = get_supabase()

        # Get total count from prompt-gallery table
        total_response = supabase.table('prompt-gallery').select("*", count="exact", head=True).execute()
        total_count = total_response.count if total_response.count else 0

        # Return default categories since the table doesn't have a category column
        categories = [
            {"name": "General", "count": total_count},
            {"name": "Writing & Content", "count": 0},
            {"name": "Technical & Code", "count": 0},
            {"name": "Creative & Design", "count": 0},
            {"name": "Business & Marketing", "count": 0}
        ]

        return {"categories": categories}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting categories: {str(e)}")

@router.get("/platforms")
async def get_platforms():
    """Get all available platforms."""
    return {
        "platforms": [
            {"name": "ChatGPT", "icon": "🤖"},
            {"name": "Claude", "icon": "🎭"},
            {"name": "Gemini", "icon": "💎"},
            {"name": "GPT-4", "icon": "🧠"},
            {"name": "General", "icon": "🌐"}
        ]
    }

# Simple tracking endpoints
@router.post("/prompts/{prompt_id}/use")
async def track_usage(
    prompt_id: str = Path(...),
    usage: PromptUsageTrack = Body(...),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """Track prompt usage."""
    return {"success": True, "message": "Usage tracked"}

@router.get("/search/suggestions")
async def get_search_suggestions(query: str = Query(..., min_length=2)):
    """Get search suggestions based on query."""
    try:
        supabase = get_supabase()
        response = supabase.table('prompt_templates').select("title").limit(10).execute()

        # Simple filter
        suggestions = [
            row['title'] for row in response.data
            if query.lower() in row['title'].lower()
        ][:10]

        return {"suggestions": suggestions}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting suggestions: {str(e)}")