from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
import os
from PIL import Image  # type: ignore
import google.generativeai as genai
from services.gemini_service import GEMINI_MODEL, MAX_API_TIMEOUT
import asyncio
import traceback
import time

router = APIRouter()

class ImagePromptRequest(BaseModel):
    text_prompt: str
    style: Optional[str] = None
    mood: Optional[str] = None
    composition: Optional[str] = None
    use_case: Optional[str] = None
    ai_tool: Optional[str] = None
    context: Optional[str] = None

@router.post("/image/from-text")
async def generate_prompt_from_text(request: ImagePromptRequest):
    """Generate an image prompt from a text description."""
    if not GEMINI_MODEL:
        raise HTTPException(status_code=500, detail="Gemini API not configured")

    system_prompt = f"""
        You are an expert in AI image generation, specifically for {request.ai_tool or 'Midjourney'}. Your task is to convert a user's idea into a detailed, precise, and evocative prompt.

        **User's idea:** "{request.text_prompt}"
        **Style:** {request.style or 'photorealistic'}
        **Mood:** {request.mood or 'neutral'}
        **Composition:** {request.composition or 'medium shot'}
        **Use Case:** {request.use_case or 'general'}
        **Additional Context:** {request.context or 'none'}

        **Instructions:**
        1.  Start the prompt with `/imagine`.
        2.  Generate a single, coherent paragraph that is highly optimized for {request.ai_tool or 'Midjourney'}.
        3.  Incorporate vivid details about the subject, environment, lighting, color, and artistic style.
        4.  If a use case like 'marketing' or a specific template is provided, the prompt must reflect that.
        5.  Append relevant Midjourney parameters like `--ar`, `--style`, and `--v 6` at the end. For aspect ratio, use a common one like `2:3` or `16:9` unless the user implies otherwise.
        
        **Example Output Format:**
        `/imagine [Detailed prompt paragraph] --ar 2:3 --style raw --v 6`
    """
    
    try:
        response = await GEMINI_MODEL.generate_content_async(system_prompt)
        return {"prompt": response.text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating prompt: {e}")


@router.post("/image/from-image")
async def generate_prompt_from_image(
    file: UploadFile = File(...),
    use_case: str = Form("general"),
    style: str = Form("descriptive")
):
    """Generate an image prompt from an uploaded image."""
    if not GEMINI_MODEL:
        raise HTTPException(status_code=500, detail="Gemini API not configured")

    try:
        image = Image.open(file.file)
        
        prompt_context = "Describe this image in a way that an AI image generator could recreate it."
        if use_case == "marketing":
            prompt_context += " The description should be suitable for a commercial or marketing campaign."
        elif use_case == "blog":
            prompt_context += " The description should be suitable for a blog post or article."

        response = await GEMINI_MODEL.generate_content_async([prompt_context, image])
        
        return {"prompt": response.text.strip()}
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error processing image: {e}") 