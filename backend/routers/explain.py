from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os
import asyncio
import time
import traceback
import hashlib
from dotenv import load_dotenv
from services.gemini_service import GEMINI_MODEL, MAX_API_TIMEOUT

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

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
async def explain_prompt(request: ExplainRequest):
    if not GEMINI_MODEL:
        raise HTTPException(status_code=500, detail="Gemini API not configured")
    
    start_time = time.time()
    
    # Check cache first
    cache_key = get_explain_cache_key(request.prompt)
    if cache_key in explain_cache:
        cache_entry = explain_cache[cache_key]
        # Check if cache entry is still valid
        if time.time() - cache_entry["timestamp"] < CACHE_TTL:
            print(f"Cache hit for explain endpoint")
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