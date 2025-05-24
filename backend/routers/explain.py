from fastapi import APIRouter
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter()

class ExplainRequest(BaseModel):
    prompt: str

@router.post("/explain")
async def explain_prompt(request: ExplainRequest):
    system_prompt = (
        "You are a prompt engineering expert. Given the following prompt, explain in detail:\n"
        "- What makes this prompt effective or ineffective\n"
        "- What assumptions it makes\n"
        "- How it could be improved for clarity, specificity, or neutrality\n"
        "Return your answer in markdown with clear sections for 'Effectiveness', 'Assumptions', and 'Improvements'."
    )
    model = genai.GenerativeModel("models/gemini-2.0-flash")
    response = model.generate_content(f"{system_prompt}\n\nPrompt:\n{request.prompt}")
    return {"explanation": response.text.strip()}