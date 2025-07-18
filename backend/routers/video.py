from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends
from pydantic import BaseModel
from services.gemini_service import generate_refined_prompts, build_video_prompt, build_commercial_prompt
from services.supabase_service import SupabaseService
from routers.users import get_current_user
from typing import Optional, Dict, Any

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
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Generate enhanced video prompts with tool-specific optimization"""
    
    # Check usage quota
    if current_user["usage_count"] >= current_user["usage_quota"]:
        raise HTTPException(
            status_code=403,
            detail="Daily usage quota exceeded. Please upgrade your subscription."
        )
    
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
        
        # Save prompt in the background
        background_tasks.add_task(
            save_video_prompt_to_db,
            current_user["id"],
            request.raw_input,
            refined_prompts,
            "video",
            request.tone,
            "",
            request.return_format,
            {
                "tool_type": request.tool_type,
                "style": request.style,
                "camera_angle": request.camera_angle,
                "lighting": request.lighting,
                "movement": request.movement,
                "quality": request.quality,
                "commercial_type": request.commercial_type,
                "context_details": request.context_details
            }
        )
        
        return {"refined_prompts": refined_prompts}
        
    except Exception as e:
        return {"error": f"Failed to generate video prompt: {str(e)}"}

@router.post("/video/quick")
async def generate_quick_video_prompt(
    request: QuickVideoPromptRequest,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Generate quick video prompts with preset templates"""
    
    # Check usage quota
    if current_user["usage_count"] >= current_user["usage_quota"]:
        raise HTTPException(
            status_code=403,
            detail="Daily usage quota exceeded. Please upgrade your subscription."
        )
    
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
                "tool_type": "runway",
                "style": "commercial",
                "lighting": "studio",
                "movement": "static",
                "quality": "4k"
            },
            "social": {
                "tool_type": "pika",
                "style": "modern",
                "lighting": "natural",
                "movement": "zoom",
                "quality": "smooth"
            },
            "documentary": {
                "tool_type": "sora",
                "style": "documentary",
                "lighting": "natural",
                "movement": "tracking",
                "quality": "film_grain"
            },
            "artistic": {
                "tool_type": "pika",
                "style": "artistic",
                "lighting": "neon",
                "movement": "pan",
                "quality": "hdr"
            }
        }
        
        template = quick_templates.get(request.template_type, quick_templates["cinematic"])
        
        # Build enhanced prompt
        enhanced_input = build_video_prompt(
            template["tool_type"],
            template["style"],
            template["movement"],
            template["lighting"],
            template["quality"],
            request.raw_input
        )
        
        # Generate refined prompts
        refined_prompts = await generate_refined_prompts(
            enhanced_input,
            "video",
            "default",
            "",
            "plain"
        )
        
        # Save prompt in the background
        background_tasks.add_task(
            save_video_prompt_to_db,
            current_user["id"],
            request.raw_input,
            refined_prompts,
            "video",
            "default",
            "",
            "plain",
            {
                "template_type": request.template_type,
                "tool_type": template["tool_type"],
                "style": template["style"],
                "lighting": template["lighting"],
                "movement": template["movement"],
                "quality": template["quality"]
            }
        )
        
        return {"refined_prompts": refined_prompts}
        
    except Exception as e:
        return {"error": f"Failed to generate quick video prompt: {str(e)}"}

@router.get("/video/templates")
async def get_video_templates():
    """Get available video prompt templates and options"""
    
    return {
        "tools": [
            {"value": "runway", "label": "Runway ML", "description": "Professional video generation with realistic motion"},
            {"value": "pika", "label": "Pika Labs", "description": "Creative and artistic video generation"},
            {"value": "sora", "label": "OpenAI Sora", "description": "Narrative storytelling and photorealistic scenes"}
        ],
        "styles": [
            {"value": "cinematic", "label": "Cinematic", "description": "Professional film-like quality"},
            {"value": "commercial", "label": "Commercial", "description": "Polished marketing style"},
            {"value": "documentary", "label": "Documentary", "description": "Natural and authentic feel"},
            {"value": "artistic", "label": "Artistic", "description": "Creative and experimental"},
            {"value": "vintage", "label": "Vintage", "description": "Retro and nostalgic"},
            {"value": "modern", "label": "Modern", "description": "Contemporary and sleek"}
        ],
        "camera_movements": [
            {"value": "static", "label": "Static", "description": "Fixed camera position"},
            {"value": "pan", "label": "Pan", "description": "Horizontal camera movement"},
            {"value": "tilt", "label": "Tilt", "description": "Vertical camera movement"},
            {"value": "zoom", "label": "Zoom", "description": "Focal length change"},
            {"value": "dolly", "label": "Dolly", "description": "Camera depth movement"},
            {"value": "tracking", "label": "Tracking", "description": "Following subject movement"},
            {"value": "aerial", "label": "Aerial", "description": "Drone-like perspective"}
        ],
        "lighting_setups": [
            {"value": "natural", "label": "Natural", "description": "Natural lighting conditions"},
            {"value": "golden_hour", "label": "Golden Hour", "description": "Warm sunset/sunrise light"},
            {"value": "blue_hour", "label": "Blue Hour", "description": "Cool twilight atmosphere"},
            {"value": "studio", "label": "Studio", "description": "Controlled professional lighting"},
            {"value": "low_key", "label": "Low Key", "description": "Dramatic shadows and contrast"},
            {"value": "high_key", "label": "High Key", "description": "Bright and airy lighting"}
        ],
        "quality_specs": [
            {"value": "4k", "label": "4K UHD", "description": "Ultra-high definition quality"},
            {"value": "cinematic", "label": "Cinematic", "description": "Professional film quality"},
            {"value": "hdr", "label": "HDR", "description": "High dynamic range"},
            {"value": "film_grain", "label": "Film Grain", "description": "Authentic film texture"},
            {"value": "smooth", "label": "Smooth", "description": "High frame rate motion"}
        ],
        "commercial_types": [
            {"value": "product_showcase", "label": "Product Showcase", "description": "Highlight product features"},
            {"value": "brand_story", "label": "Brand Story", "description": "Emotional brand narrative"},
            {"value": "social_media", "label": "Social Media", "description": "Platform-optimized content"},
            {"value": "explainer", "label": "Explainer", "description": "Educational and instructional"}
        ],
        "quick_templates": [
            {"value": "cinematic", "label": "Cinematic", "description": "Professional film-like scenes"},
            {"value": "commercial", "label": "Commercial", "description": "Marketing and advertising"},
            {"value": "social", "label": "Social Media", "description": "Platform-ready content"},
            {"value": "documentary", "label": "Documentary", "description": "Authentic storytelling"},
            {"value": "artistic", "label": "Artistic", "description": "Creative and experimental"}
        ]
    }

async def save_video_prompt_to_db(
    user_id: str,
    raw_input: str,
    refined_prompts: list,
    mode: str,
    tone: str,
    persona: str,
    return_format: str,
    metadata: dict
):
    """Save video prompt to database and update user stats."""
    # Save the prompt
    await SupabaseService.save_prompt(
        user_id, raw_input, refined_prompts, mode, tone, persona, return_format
    )
    
    # Track activity
    await SupabaseService.track_activity(
        user_id,
        "video_prompt_generated",
        None,
        {
            "tone": tone,
            "prompt_length": len(raw_input),
            "results_count": len(refined_prompts),
            "tool_type": metadata.get("tool_type", "runway"),
            "style": metadata.get("style", "cinematic")
        }
    )
    
    # Update usage statistics
    await SupabaseService.update_user_usage(
        user_id,
        prompts_generated=1,
        tokens_used=len(raw_input) // 4  # Rough estimate of tokens
    ) 