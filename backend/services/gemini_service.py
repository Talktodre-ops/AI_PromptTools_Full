import os
from dotenv import load_dotenv
import google.generativeai as genai  # type: ignore
import re
import json
import asyncio
import time
import traceback
import hashlib
from typing import Optional, Dict, Any

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("WARNING: GEMINI_API_KEY environment variable not set!")
else:
    genai.configure(api_key=API_KEY)  # type: ignore

# Create global model instance for reuse with optimized parameters
GEMINI_MODEL: Optional[Any] = None
if API_KEY:
    try:
        # Use dictionary-based configuration for better compatibility
        generation_config: Dict[str, Any] = {
            "temperature": 0.7,       # Lower temperature for more deterministic outputs
            "top_p": 0.95,            # Slightly more deterministic token selection
            "top_k": 40,              # More focused token selection
            "max_output_tokens": 1024, # Reasonable limit for outputs
        }
        
        # Create model with generation config - suppress type checking for google.generativeai module
        GEMINI_MODEL = genai.GenerativeModel(  # type: ignore
            "models/gemini-2.0-flash"
        )
        # Set generation config separately if needed
        if hasattr(GEMINI_MODEL, '_generation_config'):
            GEMINI_MODEL._generation_config = generation_config  # type: ignore
    except Exception as e:
        print(f"Error creating Gemini model: {e}")
        GEMINI_MODEL = None

# Maximum time to wait for Gemini API response in seconds
MAX_API_TIMEOUT = 60  # Increased from 30 to 60 seconds

# Simple in-memory cache for API responses
response_cache: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 3600  # Cache time-to-live in seconds (1 hour)

def get_cache_key(prompt: str, mode: str) -> str:
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
    "video": (
        "You are an expert at writing highly detailed prompts for AI video generation tools like Runway, Sora, or Pika. "
        "Rewrite this input into 2-3 detailed cinematic video generation prompt variants. "
        "Label each variant clearly as 'Variant 1:', 'Variant 2:', etc., at the start of each (without asterisks). "
        "Each variant should be optimized for AI video generation tools and include: "
        "- Specific camera angles and movements "
        "- Detailed lighting and atmosphere "
        "- Visual style and cinematic elements "
        "- Professional video terminology "
        "- Duration and quality specifications "
        "Focus on creating ready-to-use prompts that will generate high-quality video outputs.{tone_part}{persona_part}{format_part}"
    ),
}

# Enhanced video prompt templates for different tools and use cases
VIDEO_PROMPT_TEMPLATES = {
    "runway": {
        "template": (
            "Create a professional video prompt optimized for Runway ML. "
            "Include specific technical details like camera movements, lighting setups, and visual effects. "
            "Use Runway-specific terminology and formatting. "
            "Focus on realistic motion and cinematic quality."
        ),
        "style_modifiers": {
            "cinematic": "cinematic color grading, film grain, professional cinematography",
            "commercial": "polished commercial style, bright lighting, clean composition",
            "documentary": "natural documentary style, handheld camera feel, authentic lighting",
            "music-video": "dynamic editing style, creative camera angles, artistic visual effects",
            "social": "vertical format optimized, engaging quick cuts, social media friendly"
        }
    },
    "pika": {
        "template": (
            "Create a video prompt optimized for Pika Labs. "
            "Focus on artistic and creative elements, unique visual styles, and experimental techniques. "
            "Use Pika-specific formatting and emphasis on creative motion."
        ),
        "style_modifiers": {
            "artistic": "artistic interpretation, creative visual effects, unique perspective",
            "animated": "smooth animation style, vibrant colors, stylized movement",
            "experimental": "experimental visual techniques, creative transitions, innovative style",
            "retro": "vintage aesthetic, retro color palette, nostalgic atmosphere",
            "fantasy": "magical elements, fantastical lighting, dreamy atmosphere"
        }
    },
    "sora": {
        "template": (
            "Create a video prompt optimized for OpenAI's Sora. "
            "Focus on narrative storytelling, complex scenes, and realistic motion. "
            "Use detailed scene descriptions and emotional context. "
            "Emphasize photorealistic quality and natural movement."
        ),
        "style_modifiers": {
            "photorealistic": "photorealistic quality, natural lighting, realistic physics",
            "narrative": "storytelling elements, character development, emotional depth",
            "architectural": "architectural focus, structural details, spatial composition",
            "nature": "natural environment, organic movement, environmental storytelling",
            "urban": "urban setting, city atmosphere, modern aesthetic"
        }
    }
}

# Commercial and marketing templates
COMMERCIAL_TEMPLATES = {
    "product_showcase": (
        "Create a product showcase video prompt featuring {product_details}. "
        "Include smooth product rotation, elegant lighting, and premium aesthetic. "
        "Focus on highlighting key features and creating desire."
    ),
    "brand_story": (
        "Create a brand storytelling video prompt for {brand_context}. "
        "Include emotional connection, authentic moments, and brand values. "
        "Focus on lifestyle integration and aspirational content."
    ),
    "social_media": (
        "Create a social media video prompt for {platform_context}. "
        "Include platform-specific formatting, engaging hooks, and viral potential. "
        "Focus on quick engagement and shareability."
    ),
    "explainer": (
        "Create an explainer video prompt for {concept_details}. "
        "Include clear visual metaphors, step-by-step progression, and educational elements. "
        "Focus on clarity and viewer understanding."
    )
}

# Cinematic building blocks
CINEMATIC_ELEMENTS = {
    "camera_movements": {
        "static": "static camera, stable composition, fixed perspective",
        "pan": "smooth panning motion, horizontal movement, cinematic sweep",
        "tilt": "vertical tilt movement, revealing composition, dynamic perspective",
        "zoom": "smooth zoom transition, focal length change, dramatic emphasis",
        "dolly": "dolly movement, depth change, cinematic approach",
        "tracking": "tracking shot, following subject, dynamic movement",
        "crane": "crane shot, vertical movement, establishing perspective",
        "aerial": "aerial perspective, drone-like movement, sweeping overview"
    },
    "lighting_setups": {
        "natural": "natural lighting, soft shadows, organic feel",
        "golden_hour": "golden hour lighting, warm tones, magical atmosphere",
        "blue_hour": "blue hour lighting, cool tones, dramatic sky",
        "studio": "controlled studio lighting, professional setup, clean shadows",
        "low_key": "low key lighting, dramatic shadows, high contrast",
        "high_key": "high key lighting, bright and airy, minimal shadows",
        "backlit": "backlit subject, rim lighting, dramatic silhouette",
        "neon": "neon lighting, vibrant colors, urban nighttime aesthetic"
    },
    "visual_styles": {
        "cinematic": "cinematic color grading, film grain, professional cinematography, 2.35:1 aspect ratio",
        "documentary": "documentary style, handheld camera feel, natural color palette, authentic atmosphere",
        "commercial": "polished commercial style, bright lighting, clean composition, premium aesthetic",
        "music_video": "dynamic editing style, creative camera angles, artistic visual effects, rhythmic pacing",
        "vintage": "vintage aesthetic, retro color palette, film grain, nostalgic atmosphere",
        "modern": "modern aesthetic, clean lines, contemporary style, sleek presentation",
        "artistic": "artistic interpretation, creative visual effects, unique perspective, experimental techniques"
    },
    "quality_specs": {
        "4k": "4K UHD resolution, ultra-high definition, crystal clear quality",
        "cinematic": "cinematic depth of field, professional color grading, film-like quality",
        "hdr": "HDR quality, enhanced dynamic range, vibrant colors",
        "film_grain": "subtle film grain, organic texture, authentic film look",
        "smooth": "smooth motion, high frame rate, fluid movement"
    }
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

def build_video_prompt(tool_type, style, camera_movement, lighting, quality, raw_input, tone="default"):
    """Build enhanced video prompts with tool-specific optimization"""
    
    # Get base template for the tool
    tool_template = VIDEO_PROMPT_TEMPLATES.get(tool_type, VIDEO_PROMPT_TEMPLATES["runway"])
    
    # Build cinematic elements
    camera_element = CINEMATIC_ELEMENTS["camera_movements"].get(camera_movement, "smooth camera movement")
    lighting_element = CINEMATIC_ELEMENTS["lighting_setups"].get(lighting, "natural lighting")
    style_element = CINEMATIC_ELEMENTS["visual_styles"].get(style, "cinematic style")
    quality_element = CINEMATIC_ELEMENTS["quality_specs"].get(quality, "high quality")
    
    # Combine elements
    enhanced_prompt = f"""
    {tool_template["template"]}
    
    Scene Description: {raw_input}
    
    Technical Specifications:
    - Camera: {camera_element}
    - Lighting: {lighting_element}
    - Style: {style_element}
    - Quality: {quality_element}
    
    Create 2-3 detailed prompt variants optimized for {tool_type.title()} that incorporate these elements.
    Each variant should be a complete, ready-to-use prompt.
    """
    
    return enhanced_prompt.strip()

def build_commercial_prompt(template_type, context_details, raw_input):
    """Build commercial video prompts"""
    
    template = COMMERCIAL_TEMPLATES.get(template_type, COMMERCIAL_TEMPLATES["product_showcase"])
    
    if template_type == "product_showcase":
        enhanced_prompt = template.format(product_details=context_details)
    elif template_type == "brand_story":
        enhanced_prompt = template.format(brand_context=context_details)
    elif template_type == "social_media":
        enhanced_prompt = template.format(platform_context=context_details)
    elif template_type == "explainer":
        enhanced_prompt = template.format(concept_details=context_details)
    else:
        enhanced_prompt = template
    
    return f"{enhanced_prompt}\n\nScene Description: {raw_input}"
