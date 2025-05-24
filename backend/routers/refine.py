from fastapi import APIRouter
from models.prompt_request import PromptRequest
from services.gemini_service import generate_refined_prompts

router = APIRouter()

@router.post("/refine")
async def refine_prompt(request: PromptRequest):
    refined_prompts = await generate_refined_prompts(
        request.raw_input,
        request.mode,
        request.tone,
        request.persona,
        request.return_format
    )
    return {"refined_prompts": refined_prompts}