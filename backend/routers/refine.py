from fastapi import APIRouter, BackgroundTasks, HTTPException, Query, Path
from models.prompt_request import PromptRequest
from services.gemini_service import generate_refined_prompts
from services.supabase_service import SupabaseService
from typing import Dict, Any, List, Optional
import uuid
import logging

router = APIRouter()

@router.post("/refine")
async def refine_prompt(
    request: PromptRequest,
    background_tasks: BackgroundTasks,
):
    """Generate refined prompts. Authentication disabled for development."""
    
    # Generate prompts
    try:
        refined_prompts = await generate_refined_prompts(
            request.raw_input,
            request.mode,
            request.tone,
            request.persona,
            request.return_format
        )

        # Check if the response indicates an error
        if (isinstance(refined_prompts, list) and len(refined_prompts) > 0 and
            isinstance(refined_prompts[0], str) and
            "Sorry, something went wrong" in refined_prompts[0]):

            # Log the actual error for debugging
            logging.error(f"Prompt generation failed: {refined_prompts[0]}")

            # Return generic error to client
            raise HTTPException(
                status_code=500,
                detail="Failed to generate refined prompts. Please try again later."
            )

        return {"refined_prompts": refined_prompts}

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the actual error for debugging
        logging.error(f"Unexpected error in refine_prompt: {str(e)}")

        # Return generic error to client
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred. Please try again later."
        )

# Note: User-specific endpoints removed for development simplicity
# These can be re-enabled when authentication system is implemented