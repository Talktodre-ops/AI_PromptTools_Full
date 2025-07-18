from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends, Query, Path
from models.prompt_request import PromptRequest
from services.gemini_service import generate_refined_prompts
from services.supabase_service import SupabaseService
from routers.users import get_current_user
from typing import Dict, Any, List, Optional
import uuid

router = APIRouter()

@router.post("/refine")
async def refine_prompt(
    request: PromptRequest,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Generate refined prompts and save to database."""
    # Check usage quota
    if current_user["usage_count"] >= current_user["usage_quota"]:
        raise HTTPException(
            status_code=403,
            detail="Daily usage quota exceeded. Please upgrade your subscription."
        )
    
    # Generate prompts
    refined_prompts = await generate_refined_prompts(
        request.raw_input,
        request.mode,
        request.tone,
        request.persona,
        request.return_format
    )
    
    # Save prompt in the background
    background_tasks.add_task(
        save_prompt_to_db,
        current_user["id"],
        request.raw_input,
        refined_prompts,
        request.mode,
        request.tone,
        request.persona,
        request.return_format
    )
    
    return {"refined_prompts": refined_prompts}

@router.get("/prompts")
async def get_user_prompts(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get user's saved prompts."""
    prompts = await SupabaseService.get_user_prompts(current_user["id"], limit, offset)
    return {"prompts": prompts}

@router.post("/prompts/{prompt_id}/favorite")
async def toggle_favorite(
    prompt_id: str = Path(...),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Toggle favorite status of a prompt."""
    result = await SupabaseService.toggle_favorite(prompt_id, current_user["id"])
    return {"success": True, "is_favorite": result.get("is_favorite", False)}

async def save_prompt_to_db(
    user_id: str,
    raw_input: str,
    refined_prompts: List[str],
    mode: str,
    tone: str,
    persona: str,
    return_format: str
):
    """Save prompt to database and update user stats."""
    # Save the prompt
    await SupabaseService.save_prompt(
        user_id, raw_input, refined_prompts, mode, tone, persona, return_format
    )
    
    # Track activity
    await SupabaseService.track_activity(
        user_id,
        "prompt_generated",
        None,
        {
            "mode": mode,
            "tone": tone,
            "prompt_length": len(raw_input),
            "results_count": len(refined_prompts)
        }
    )
    
    # Update usage statistics
    await SupabaseService.update_user_usage(
        user_id,
        prompts_generated=1,
        tokens_used=len(raw_input) // 4  # Rough estimate of tokens
    )