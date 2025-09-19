"""
Prompt Gallery API Router
Advanced endpoints for the enhanced prompt gallery with community features
"""
from fastapi import APIRouter, HTTPException, Depends, Query, Path, Body
from typing import Dict, Any, List, Optional, Union
from pydantic import BaseModel
from services.supabase_service import SupabaseService
from routers.users import get_current_user, get_optional_user
import json

router = APIRouter(prefix="/gallery", tags=["Gallery"])

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
    """
    Browse prompts with advanced filtering and sorting.
    """
    try:
        offset = (page - 1) * limit

        # Build the query
        supabase = SupabaseService.get_client()
        if not supabase:
            raise HTTPException(status_code=500, detail="Database connection failed")

        query = supabase.table('prompt_templates').select("""
            id, title, description, category, template_content, mode, tone, persona,
            difficulty_level, complexity_score, tags, platform_tags, use_cases,
            effectiveness_score, rating, rating_count, usage_count, created_at,
            original_source, best_practices, variations, examples
        """)

        # Apply filters
        if category:
            query = query.eq('category', category)

        if difficulty:
            query = query.eq('difficulty_level', difficulty)

        if platform:
            query = query.contains('platform_tags', [platform])

        if search:
            # Search in title, description, and tags
            # Note: This is a simplified search. In production, use full-text search
            query = query.or_(f'title.ilike.%{search}%,description.ilike.%{search}%')

        # Apply sorting
        if sort_by == "recent":
            query = query.order('created_at', desc=True)
        elif sort_by == "rating":
            query = query.order('rating', desc=True)
        elif sort_by == "effectiveness":
            query = query.order('effectiveness_score', desc=True)
        elif sort_by == "usage":
            query = query.order('usage_count', desc=True)
        else:  # popular (default)
            # Combine multiple factors for popularity
            query = query.order('rating', desc=True).order('usage_count', desc=True)

        # Apply pagination
        query = query.range(offset, offset + limit - 1)

        response = query.execute()

        # Get total count for pagination
        count_query = supabase.table('prompt_templates').select("count", count="exact")
        if category:
            count_query = count_query.eq('category', category)
        if difficulty:
            count_query = count_query.eq('difficulty_level', difficulty)
        if platform:
            count_query = count_query.contains('platform_tags', [platform])

        count_response = count_query.execute()
        total_count = count_response.count

        # Add user-specific data if authenticated
        prompts = response.data
        if current_user:
            # Add favorite status for each prompt
            for prompt in prompts:
                fav_response = supabase.table('user_prompt_favorites').select("id").eq('user_id', current_user['id']).eq('prompt_id', prompt['id']).execute()
                prompt['is_favorited'] = len(fav_response.data) > 0

        return {
            "prompts": prompts,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_count,
                "pages": (total_count + limit - 1) // limit
            },
            "filters": {
                "category": category,
                "difficulty": difficulty,
                "platform": platform,
                "search": search,
                "sort_by": sort_by
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
        # Get prompt details
        response = SupabaseService.supabase.table('prompt_templates').select("*").eq('id', prompt_id).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Prompt not found")

        prompt = response.data[0]

        # Get reviews
        reviews_response = SupabaseService.supabase.table('prompt_reviews').select("""
            id, rating, review_text, helpful_count, created_at,
            users(email, display_name)
        """).eq('prompt_id', prompt_id).order('created_at', desc=True).execute()

        prompt['reviews'] = reviews_response.data

        # Add user-specific data if authenticated
        if current_user:
            # Check if favorited
            fav_response = SupabaseService.supabase.table('user_prompt_favorites').select("id").eq('user_id', current_user['id']).eq('prompt_id', prompt_id).execute()
            prompt['is_favorited'] = len(fav_response.data) > 0

            # Check if user has reviewed
            user_review = SupabaseService.supabase.table('prompt_reviews').select("*").eq('user_id', current_user['id']).eq('prompt_id', prompt_id).execute()
            prompt['user_review'] = user_review.data[0] if user_review.data else None

        return prompt

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting prompt details: {str(e)}")

@router.get("/collections")
async def get_collections():
    """Get all prompt collections."""
    try:
        response = SupabaseService.supabase.table('prompt_collections').select("*").order('order_index').execute()

        # Get prompt count for each collection
        for collection in response.data:
            if collection['prompts']:
                count = len(collection['prompts'])
            else:
                count = 0
            collection['prompt_count'] = count

        return {"collections": response.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting collections: {str(e)}")

@router.get("/collections/{collection_slug}")
async def get_collection_prompts(
    collection_slug: str = Path(...),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get prompts in a specific collection."""
    try:
        # Get collection
        collection_response = SupabaseService.supabase.table('prompt_collections').select("*").eq('slug', collection_slug).execute()

        if not collection_response.data:
            raise HTTPException(status_code=404, detail="Collection not found")

        collection = collection_response.data[0]

        # Get prompts in collection
        if collection['prompts']:
            prompt_ids = collection['prompts']
            prompts_response = SupabaseService.supabase.table('prompt_templates').select("""
                id, title, description, category, difficulty_level,
                rating, rating_count, usage_count, effectiveness_score, tags
            """).in_('id', prompt_ids).execute()

            prompts = prompts_response.data
        else:
            prompts = []

        return {
            "collection": collection,
            "prompts": prompts,
            "count": len(prompts)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting collection: {str(e)}")

@router.get("/stats")
async def get_gallery_stats():
    """Get gallery statistics."""
    try:
        # Total prompts
        total_prompts = SupabaseService.supabase.table('prompt_templates').select("count", count="exact").execute()

        # Categories breakdown
        categories_response = SupabaseService.supabase.table('prompt_templates').select("category").execute()
        categories = {}
        for row in categories_response.data:
            cat = row['category']
            categories[cat] = categories.get(cat, 0) + 1

        # Top rated prompts
        top_rated = SupabaseService.supabase.table('prompt_templates').select("id, title, rating").order('rating', desc=True).limit(5).execute()

        # Most used prompts
        most_used = SupabaseService.supabase.table('prompt_templates').select("id, title, usage_count").order('usage_count', desc=True).limit(5).execute()

        return {
            "total_prompts": total_prompts.count,
            "categories": categories,
            "top_rated": top_rated.data,
            "most_used": most_used.data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")

# User Interaction Endpoints
@router.post("/prompts/{prompt_id}/favorite")
async def toggle_favorite(
    prompt_id: str = Path(...),
    data: PromptFavoriteToggle = Body(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Toggle favorite status for a prompt."""
    try:
        if data.is_favorite:
            # Add to favorites
            SupabaseService.supabase.table('user_prompt_favorites').insert({
                'user_id': current_user['id'],
                'prompt_id': prompt_id
            }).execute()
        else:
            # Remove from favorites
            SupabaseService.supabase.table('user_prompt_favorites').delete().eq('user_id', current_user['id']).eq('prompt_id', prompt_id).execute()

        return {"success": True, "is_favorited": data.is_favorite}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error toggling favorite: {str(e)}")

@router.post("/prompts/{prompt_id}/review")
async def submit_review(
    prompt_id: str = Path(...),
    review: PromptReviewCreate = Body(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Submit a review for a prompt."""
    try:
        # Check if user already reviewed
        existing = SupabaseService.supabase.table('prompt_reviews').select("id").eq('user_id', current_user['id']).eq('prompt_id', prompt_id).execute()

        if existing.data:
            # Update existing review
            SupabaseService.supabase.table('prompt_reviews').update({
                'rating': review.rating,
                'review_text': review.review_text
            }).eq('id', existing.data[0]['id']).execute()
        else:
            # Create new review
            SupabaseService.supabase.table('prompt_reviews').insert({
                'prompt_id': prompt_id,
                'user_id': current_user['id'],
                'rating': review.rating,
                'review_text': review.review_text
            }).execute()

        return {"success": True, "message": "Review submitted successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting review: {str(e)}")

@router.post("/prompts/{prompt_id}/use")
async def track_usage(
    prompt_id: str = Path(...),
    usage: PromptUsageTrack = Body(...),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """Track prompt usage."""
    try:
        user_id = current_user['id'] if current_user else None

        SupabaseService.supabase.table('prompt_usage_tracking').insert({
            'prompt_id': prompt_id,
            'user_id': user_id,
            'platform': usage.platform,
            'success_rating': usage.success_rating,
            'usage_context': usage.usage_context
        }).execute()

        return {"success": True, "message": "Usage tracked"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error tracking usage: {str(e)}")

@router.get("/user/favorites")
async def get_user_favorites(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get user's favorite prompts."""
    try:
        offset = (page - 1) * limit

        response = SupabaseService.supabase.table('user_prompt_favorites').select("""
            created_at,
            prompt_templates(
                id, title, description, category, rating,
                usage_count, effectiveness_score
            )
        """).eq('user_id', current_user['id']).order('created_at', desc=True).range(offset, offset + limit - 1).execute()

        # Count total favorites
        count_response = SupabaseService.supabase.table('user_prompt_favorites').select("count", count="exact").eq('user_id', current_user['id']).execute()

        return {
            "favorites": response.data,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": count_response.count,
                "pages": (count_response.count + limit - 1) // limit
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting favorites: {str(e)}")

# Community Features
@router.post("/prompts/submit")
async def submit_prompt(
    submission: PromptSubmission = Body(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Submit a new prompt to the gallery."""
    try:
        # Basic validation
        if len(submission.title) < 5:
            raise HTTPException(status_code=400, detail="Title must be at least 5 characters")

        if len(submission.template_content) < 20:
            raise HTTPException(status_code=400, detail="Prompt content must be at least 20 characters")

        # Create prompt record
        prompt_data = {
            'title': submission.title,
            'description': submission.description,
            'category': submission.category,
            'template_content': submission.template_content,
            'mode': submission.mode,
            'tone': submission.tone,
            'persona': submission.persona,
            'tags': submission.tags,
            'created_by': current_user['id'],
            'original_source': 'user_submission',
            'is_active': False,  # Requires moderation
            'difficulty_level': 'intermediate',
            'complexity_score': min(100, len(submission.template_content) / 10),
            'effectiveness_score': 70.0,
            'platform_tags': ['ChatGPT', 'Claude', 'Gemini']
        }

        response = SupabaseService.supabase.table('prompt_templates').insert(prompt_data).execute()

        return {
            "success": True,
            "message": "Prompt submitted for review",
            "prompt_id": response.data[0]['id']
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error submitting prompt: {str(e)}")

@router.get("/search/suggestions")
async def get_search_suggestions(query: str = Query(..., min_length=2)):
    """Get search suggestions based on query."""
    try:
        # Search in titles and tags
        response = SupabaseService.supabase.table('prompt_templates').select("title, tags").or_(f'title.ilike.%{query}%').limit(10).execute()

        suggestions = []
        for row in response.data:
            suggestions.append(row['title'])
            # Add relevant tags
            if row['tags']:
                for tag in row['tags']:
                    if query.lower() in tag.lower() and tag not in suggestions:
                        suggestions.append(tag)

        return {"suggestions": suggestions[:10]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting suggestions: {str(e)}")

@router.get("/categories")
async def get_categories():
    """Get all available categories with counts."""
    try:
        response = SupabaseService.supabase.table('prompt_templates').select("category").execute()

        categories = {}
        for row in response.data:
            cat = row['category']
            categories[cat] = categories.get(cat, 0) + 1

        # Sort by count
        sorted_categories = sorted(categories.items(), key=lambda x: x[1], reverse=True)

        return {
            "categories": [
                {"name": cat, "count": count}
                for cat, count in sorted_categories
            ]
        }

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
            {"name": "Copilot", "icon": "👨‍💻"},
            {"name": "General", "icon": "🌐"}
        ]
    }