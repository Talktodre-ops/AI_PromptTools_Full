from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta, date
from services.supabase_service import SupabaseService
from routers.users import get_current_user

router = APIRouter()

@router.get("/analytics/usage")
async def get_user_usage(
    days: int = Query(7, ge=1, le=30),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get usage statistics for the current user."""
    supabase = SupabaseService.get_client()
    if not supabase:
        raise HTTPException(
            status_code=500,
            detail="Database connection failed"
        )
    
    # Calculate date range
    end_date = date.today()
    start_date = end_date - timedelta(days=days-1)
    
    # Query usage statistics
    result = supabase.table("usage_analytics")\
        .select("*")\
        .eq("user_id", current_user["id"])\
        .gte("date", start_date.isoformat())\
        .lte("date", end_date.isoformat())\
        .order("date")\
        .execute()
    
    usage_data = result.data if result.data else []
    
    # Fill in missing dates with zero values
    date_range = [start_date + timedelta(days=i) for i in range(days)]
    date_map = {item["date"]: item for item in usage_data}
    
    filled_data = []
    for d in date_range:
        d_str = d.isoformat()
        if d_str in date_map:
            filled_data.append(date_map[d_str])
        else:
            filled_data.append({
                "date": d_str,
                "prompts_generated": 0,
                "tokens_used": 0,
                "api_calls": 0
            })
    
    return {
        "usage_data": filled_data,
        "subscription": current_user["subscription_tier"],
        "usage_quota": current_user["usage_quota"],
        "usage_count": current_user["usage_count"]
    }

@router.get("/analytics/activities")
async def get_user_activities(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get activity history for the current user."""
    supabase = SupabaseService.get_client()
    if not supabase:
        raise HTTPException(
            status_code=500,
            detail="Database connection failed"
        )
    
    # Query user activities
    result = supabase.table("user_activities")\
        .select("*")\
        .eq("user_id", current_user["id"])\
        .order("created_at", desc=True)\
        .limit(limit)\
        .offset(offset)\
        .execute()
    
    activities = result.data if result.data else []
    
    return {
        "activities": activities,
        "count": len(activities)
    }

@router.get("/analytics/summary")
async def get_user_summary(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a summary of the user's usage statistics."""
    supabase = SupabaseService.get_client()
    if not supabase:
        raise HTTPException(
            status_code=500,
            detail="Database connection failed"
        )
    
    # Get total prompt count
    prompt_result = supabase.table("user_prompts")\
        .select("count", count="exact")\
        .eq("user_id", current_user["id"])\
        .execute()
    
    total_prompts = prompt_result.count if hasattr(prompt_result, "count") else 0
    
    # Get favorite prompt count
    favorites_result = supabase.table("user_prompts")\
        .select("count", count="exact")\
        .eq("user_id", current_user["id"])\
        .eq("is_favorite", True)\
        .execute()
    
    favorite_prompts = favorites_result.count if hasattr(favorites_result, "count") else 0
    
    # Get total tokens used
    tokens_result = supabase.table("usage_analytics")\
        .select("tokens_used")\
        .eq("user_id", current_user["id"])\
        .execute()
    
    total_tokens = sum(item.get("tokens_used", 0) for item in (tokens_result.data or []))
    
    # Calculate days since joining
    created_at = datetime.fromisoformat(current_user["created_at"].replace("Z", "+00:00"))
    days_since_joining = (datetime.now() - created_at).days + 1
    
    return {
        "total_prompts": total_prompts,
        "favorite_prompts": favorite_prompts,
        "total_tokens": total_tokens,
        "days_since_joining": days_since_joining,
        "subscription_tier": current_user["subscription_tier"],
        "usage_quota": current_user["usage_quota"],
        "usage_count": current_user["usage_count"]
    } 