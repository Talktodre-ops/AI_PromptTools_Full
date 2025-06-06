import os
from dotenv import load_dotenv
import google.generativeai as genai
import re
import json
import asyncio
import time
import traceback
import hashlib
from functools import lru_cache

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("WARNING: GEMINI_API_KEY environment variable not set!")
else:
    genai.configure(api_key=API_KEY)

# Create global model instance for reuse with optimized parameters
if API_KEY:
    generation_config = {
        "temperature": 0.7,       # Lower temperature for more deterministic outputs
        "top_p": 0.95,            # Slightly more deterministic token selection
        "top_k": 40,              # More focused token selection
        "max_output_tokens": 1024, # Reasonable limit for outputs
    }
    
    GEMINI_MODEL = genai.GenerativeModel(
        "models/gemini-2.0-flash",
        generation_config=generation_config
    )
else:
    GEMINI_MODEL = None

# Maximum time to wait for Gemini API response in seconds
MAX_API_TIMEOUT = 60  # Increased from 30 to 60 seconds

# Simple in-memory cache for API responses
response_cache = {}
CACHE_TTL = 3600  # Cache time-to-live in seconds (1 hour)

def get_cache_key(prompt, mode):
    """Generate a cache key from the prompt and mode"""
    key_string = f"{prompt}:{mode}"
    return hashlib.md5(key_string.encode()).hexdigest()

PROMPT_TEMPLATES = {
    "basic": (
        "Rewrite this input as a single, ready-to-use prompt for an AI assistant. "
        "No explanations, just the prompt.{tone_part}{persona_part}{format_part}"
    ),
    "quick": (
        "Rewrite this input as 2–3 ready-to-use, one-line prompts for an AI assistant. "
        "No explanations, just the prompts, each on its own line or as a bullet point.{tone_part}{persona_part}{format_part}"
    ),
    "deep": (
        "Refine this input into 2–3 high-quality prompt variants for an AI assistant. "
        "Label each variant clearly as 'Variant 1:', 'Variant 2:', etc., at the start of each (without asterisks). "
        "Each variant should include task intent, format instructions, and constraints. "
        "Use dashes (-) for bullet points, not asterisks (*).{tone_part}{persona_part}{format_part}"
    ),
    "few-shot": (
        "Rewrite this input as a prompt for an AI assistant, and include 2–3 example input/output pairs (few-shot examples) to guide the AI. "
        "Label the prompt and each example clearly.{tone_part}{persona_part}{format_part}"
    ),
    "cot": (
        "Rewrite this input as a prompt for an AI assistant that encourages chain-of-thought reasoning. "
        "Include instructions for the AI to explain its reasoning step by step before giving a final answer.{tone_part}{persona_part}{format_part}"
    ),
}

def build_prompt(mode, tone, persona, return_format, raw_input):
    base_prompt = PROMPT_TEMPLATES.get(mode, PROMPT_TEMPLATES["deep"])
    tone_part = f" Use a {tone} tone." if tone and tone != "default" else ""
    persona_part = f" Write the prompts {persona}." if persona and persona != "none" else ""
    format_part = ""
    if return_format == "markdown":
        format_part = " Format the output in markdown."
    elif return_format == "json":
        format_part = " Format the output as a JSON object with keys for each component (e.g., intent, structure, constraints, final_prompt, examples, rationale, etc.)."
    prompt = base_prompt.format(tone_part=tone_part, persona_part=persona_part, format_part=format_part)
    return f"{prompt}\n\nUser input: {raw_input}"

def clean_markdown_text(text):
    # Replace asterisk bullet points with dashes
    text = re.sub(r'^\s*\*\s+', '- ', text, flags=re.MULTILINE)
    
    # Clean up variant headers (remove asterisks from variant labels)
    text = re.sub(r'\*\*Variant (\d+):\*\*', 'Variant \\1:', text)
    
    # Ensure consistent spacing after variant label
    text = re.sub(r'(Variant \d+:)(\S)', '\\1 \\2', text)
    
    # Remove any remaining standalone asterisks
    text = re.sub(r'(?<!\*)\*(?!\*)', '', text)
    
    # Remove double asterisks (bold markdown)
    text = re.sub(r'\*\*(.*?)\*\*', '\\1', text)
    
    return text

async def generate_refined_prompts(
    raw_input: str,
    mode: str = "deep",
    tone: str = "default",
    persona: str = "",
    return_format: str = "plain"
):
    if not API_KEY or not GEMINI_MODEL:
        return ["Error: Gemini API key not configured. Please check your environment variables."]
    
    start_time = time.time()
    
    try:
        prompt = build_prompt(mode, tone, persona, return_format, raw_input)
        print(f"Sending prompt to Gemini API (mode: {mode}, length: {len(prompt)})")
        
        # Check cache first
        cache_key = get_cache_key(prompt, mode)
        if cache_key in response_cache:
            cache_entry = response_cache[cache_key]
            # Check if cache entry is still valid
            if time.time() - cache_entry["timestamp"] < CACHE_TTL:
                print(f"Cache hit for prompt (mode: {mode})")
                return cache_entry["response"]
            else:
                # Remove expired cache entry
                del response_cache[cache_key]
        
        # Use async version of generate_content with timeout
        try:
            # Create a task for the API call
            api_task = asyncio.create_task(GEMINI_MODEL.generate_content_async(prompt))
            
            # Wait for the task to complete with a timeout
            response = await asyncio.wait_for(api_task, timeout=MAX_API_TIMEOUT)
            
            elapsed = time.time() - start_time
            print(f"Gemini API response received in {elapsed:.2f} seconds")
            
            text = response.text.strip()
        except asyncio.TimeoutError:
            elapsed = time.time() - start_time
            print(f"Gemini API timeout after {elapsed:.2f} seconds")
            return ["Sorry, the request timed out. Please try again with a shorter prompt or simpler request."]
        
        result = None
        if return_format == "json":
            try:
                # Try to parse as JSON object or array
                result = json.loads(text)
            except Exception as e:
                print(f"JSON parsing error: {str(e)}")
                # Fallback: return as single string
                result = [text]
        elif mode in ["basic", "quick"]:
            # Extract lines or bullet points
            lines = re.findall(r"^(?:[-*]\s*)?(.*\S.*)$", text, re.MULTILINE)
            result = [l.strip() for l in lines if l.strip() and not l.lower().startswith("prompt")]
        elif mode == "deep":
            # First, try to extract variants with or without asterisks
            variants = re.findall(
                r"(?:\*\*)?Variant (\d+)(?:\*\*)?:(.+?)(?=(?:\n(?:\*\*)?Variant \d+(?:\*\*)?:|$))", 
                text, 
                re.DOTALL
            )
            
            if not variants:
                # If no variants found, return the cleaned text
                result = [clean_markdown_text(text)]
            else:
                # Clean each variant and format properly
                cleaned_variants = []
                for variant_num, variant_content in variants:
                    if variant_content.strip():
                        variant_text = f"Variant {variant_num}:{variant_content}"
                        cleaned_variant = clean_markdown_text(variant_text)
                        cleaned_variants.append(cleaned_variant)
                
                result = cleaned_variants if cleaned_variants else [clean_markdown_text(text)]
        else:
            # For few-shot and cot, clean and return the full text
            result = [clean_markdown_text(text)]
        
        # Cache the result
        response_cache[cache_key] = {
            "response": result,
            "timestamp": time.time()
        }
        
        return result
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"Error in Gemini service after {elapsed:.2f} seconds: {str(e)}")
        print(traceback.format_exc())
        return [f"Sorry, something went wrong generating your prompt: {str(e)}. Please try again."]
