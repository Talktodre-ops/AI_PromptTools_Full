from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from services.gemini_service import generate_refined_prompts, build_video_prompt, build_commercial_prompt
from typing import Optional
import logging

router = APIRouter()

class VideoPromptRequest(BaseModel):
    raw_input: str
    camera_angle: str = "aerial"
    lighting: str = "natural"
    movement: str = "static"
    style: str = "cinematic"
    tone: str = "default"
    return_format: str = "plain"
    # New enhanced fields
    tool_type: Optional[str] = "runway"  # runway, pika, sora
    quality: Optional[str] = "4k"  # 4k, cinematic, hdr, film_grain, smooth
    commercial_type: Optional[str] = None  # product_showcase, brand_story, social_media, explainer
    context_details: Optional[str] = None  # Additional context for commercial templates

class QuickVideoPromptRequest(BaseModel):
    raw_input: str
    template_type: str = "cinematic"  # cinematic, commercial, social, documentary, artistic

@router.post("/video")
async def generate_video_prompt(
    request: VideoPromptRequest,
    background_tasks: BackgroundTasks,
):
    """Generate enhanced video prompts with tool-specific optimization. Authentication disabled for development."""

    try:
        # Check if this is a commercial template request
        if request.commercial_type:
            # Use commercial template
            enhanced_input = build_commercial_prompt(
                request.commercial_type,
                request.context_details or "",
                request.raw_input
            )
        else:
            # Use advanced video prompt builder
            enhanced_input = build_video_prompt(
                request.tool_type,
                request.style,
                request.movement,
                request.lighting,
                request.quality,
                request.raw_input,
                request.tone
            )

        # Generate refined prompts using the enhanced input
        refined_prompts = await generate_refined_prompts(
            enhanced_input,
            "video",
            request.tone,
            "",  # No persona for video prompts
            request.return_format
        )

        # Check if the response indicates an error
        if (isinstance(refined_prompts, list) and len(refined_prompts) > 0 and
            isinstance(refined_prompts[0], str) and
            "Sorry, something went wrong" in refined_prompts[0]):

            # Log the actual error for debugging
            logging.error(f"Video prompt generation failed: {refined_prompts[0]}")

            # Return generic error to client
            raise HTTPException(
                status_code=500,
                detail="Failed to generate video prompts. Please try again later."
            )

        return {"refined_prompts": refined_prompts}

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the actual error for debugging
        logging.error(f"Unexpected error in generate_video_prompt: {str(e)}")

        # Return generic error to client
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while generating video prompts. Please try again later."
        )

@router.post("/video/quick")
async def generate_quick_video_prompt(
    request: QuickVideoPromptRequest,
    background_tasks: BackgroundTasks,
):
    """Generate quick video prompts with preset templates. Authentication disabled for development."""

    try:
        # Quick template mapping
        quick_templates = {
            "cinematic": {
                "tool_type": "runway",
                "style": "cinematic",
                "lighting": "golden_hour",
                "movement": "dolly",
                "quality": "cinematic"
            },
            "commercial": {
                "tool_type": "pika",
                "style": "commercial",
                "lighting": "studio",
                "movement": "static",
                "quality": "4k"
            },
            "social": {
                "tool_type": "runway",
                "style": "modern",
                "lighting": "natural",
                "movement": "handheld",
                "quality": "smooth"
            },
            "documentary": {
                "tool_type": "sora",
                "style": "realistic",
                "lighting": "natural",
                "movement": "steady",
                "quality": "film_grain"
            },
            "artistic": {
                "tool_type": "runway",
                "style": "artistic",
                "lighting": "dramatic",
                "movement": "creative",
                "quality": "hdr"
            }
        }

        # Get template settings
        template = quick_templates.get(request.template_type, quick_templates["cinematic"])

        # Build enhanced input using template
        enhanced_input = build_video_prompt(
            template["tool_type"],
            template["style"],
            template["movement"],
            template["lighting"],
            template["quality"],
            request.raw_input,
            "professional"
        )

        # Generate refined prompts
        refined_prompts = await generate_refined_prompts(
            enhanced_input,
            "video",
            "professional",
            "",
            "plain"
        )

        # Check if the response indicates an error
        if (isinstance(refined_prompts, list) and len(refined_prompts) > 0 and
            isinstance(refined_prompts[0], str) and
            "Sorry, something went wrong" in refined_prompts[0]):

            # Log the actual error for debugging
            logging.error(f"Quick video prompt generation failed: {refined_prompts[0]}")

            # Return generic error to client
            raise HTTPException(
                status_code=500,
                detail="Failed to generate quick video prompts. Please try again later."
            )

        return {"refined_prompts": refined_prompts}

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the actual error for debugging
        logging.error(f"Unexpected error in generate_quick_video_prompt: {str(e)}")

        # Return generic error to client
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while generating quick video prompts. Please try again later."
        )

@router.get("/video/templates")
async def get_video_templates():
    """Get available video template categories"""
    templates = {
        "categories": [
            {
                "id": "cinematic",
                "name": "Cinematic",
                "description": "Professional movie-style prompts with cinematic quality",
                "icon": "film"
            },
            {
                "id": "commercial",
                "name": "Commercial",
                "description": "Business and marketing video prompts",
                "icon": "briefcase"
            },
            {
                "id": "social",
                "name": "Social Media",
                "description": "Quick, engaging content for social platforms",
                "icon": "share"
            },
            {
                "id": "documentary",
                "name": "Documentary",
                "description": "Realistic, documentary-style prompts",
                "icon": "camera"
            },
            {
                "id": "artistic",
                "name": "Artistic",
                "description": "Creative and experimental video prompts",
                "icon": "palette"
            }
        ]
    }
    return templates

# Note: User tracking and database functions removed for development simplicity