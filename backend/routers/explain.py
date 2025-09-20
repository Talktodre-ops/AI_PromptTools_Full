from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel
import google.generativeai as genai
import os
import asyncio
import time
import traceback
import hashlib
from dotenv import load_dotenv
from services.gemini_service import GEMINI_MODEL, MAX_API_TIMEOUT
from services.supabase_service import SupabaseService
from routers.users import get_current_user
from typing import Dict, Any

load_dotenv()
# Initialize with configure method - this is the correct approach for version 0.3.2
if os.getenv("GEMINI_API_KEY"):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))  # type: ignore

router = APIRouter()

# Simple in-memory cache for explain endpoint
explain_cache = {}
CACHE_TTL = 3600  # Cache time-to-live in seconds (1 hour)

def get_explain_cache_key(prompt):
    """Generate a cache key from the prompt"""
    return hashlib.md5(prompt.encode()).hexdigest()

class ExplainRequest(BaseModel):
    prompt: str

@router.post("/explain")
async def explain_prompt(
    request: ExplainRequest,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    if not GEMINI_MODEL:
        raise HTTPException(status_code=500, detail="Gemini API not configured")
    
    # Check usage quota
    if current_user["usage_count"] >= current_user["usage_quota"]:
        raise HTTPException(
            status_code=403,
            detail="Daily usage quota exceeded. Please upgrade your subscription."
        )
    
    start_time = time.time()
    
    # Check cache first
    cache_key = get_explain_cache_key(request.prompt)
    if cache_key in explain_cache:
        cache_entry = explain_cache[cache_key]
        # Check if cache entry is still valid
        if time.time() - cache_entry["timestamp"] < CACHE_TTL:
            print(f"Cache hit for explain endpoint")
            
            # Track activity in the background even for cached responses
            background_tasks.add_task(
                track_explanation_activity,
                current_user["id"],
                request.prompt,
                cache_entry["response"],
                True  # is_cached
            )
            
            return {"explanation": cache_entry["response"]}
        else:
            # Remove expired cache entry
            del explain_cache[cache_key]
    
    system_prompt = (
        "You are a prompt engineering expert. Given the following prompt, explain in detail:\n"
        "- What makes this prompt effective or ineffective\n"
        "- What assumptions it makes\n"
        "- How it could be improved for clarity, specificity, or neutrality\n"
        "Return your answer in markdown with clear sections for 'Effectiveness', 'Assumptions', and 'Improvements'."
    )
    
    try:
        # Create a task for the API call
        api_task = asyncio.create_task(
            GEMINI_MODEL.generate_content_async(f"{system_prompt}\n\nPrompt:\n{request.prompt}")
        )
        
        # Wait for the task to complete with a timeout
        response = await asyncio.wait_for(api_task, timeout=MAX_API_TIMEOUT)
        
        elapsed = time.time() - start_time
        print(f"Explain endpoint response received in {elapsed:.2f} seconds")
        
        result = response.text.strip()
        
        # Cache the result
        explain_cache[cache_key] = {
            "response": result,
            "timestamp": time.time()
        }
        
        # Track activity in the background
        background_tasks.add_task(
            track_explanation_activity,
            current_user["id"],
            request.prompt,
            result,
            False  # is_cached
        )
        
        return {"explanation": result}
    except asyncio.TimeoutError:
        elapsed = time.time() - start_time
        print(f"Explain endpoint timeout after {elapsed:.2f} seconds")
        raise HTTPException(
            status_code=504, 
            detail="Request timed out. Please try again with a shorter prompt."
        )
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"Error in explain endpoint after {elapsed:.2f} seconds: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )

async def track_explanation_activity(user_id: str, prompt: str, explanation: str, is_cached: bool = False):
    """Track explanation activity in the database."""
    # Track activity
    await SupabaseService.track_activity(
        user_id,
        "prompt_explained",
        None,
        {
            "prompt_length": len(prompt),
            "explanation_length": len(explanation),
            "is_cached": is_cached
        }
    )
    
    # Update usage statistics - only if not cached
    if not is_cached:
        await SupabaseService.update_user_usage(
            user_id,
            prompts_generated=1,
            tokens_used=len(prompt) // 4  # Rough estimate of tokens
        )