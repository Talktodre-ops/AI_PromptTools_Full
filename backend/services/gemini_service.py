import os
from dotenv import load_dotenv
import google.generativeai as genai
import re
import json

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

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
    model = genai.GenerativeModel("models/gemini-2.0-flash")
    try:
        prompt = build_prompt(mode, tone, persona, return_format, raw_input)
        response = model.generate_content(prompt)
        text = response.text.strip()

        if return_format == "json":
            try:
                # Try to parse as JSON object or array
                return json.loads(text)
            except Exception:
                # Fallback: return as single string
                return [text]

        if mode in ["basic", "quick"]:
            # Extract lines or bullet points
            lines = re.findall(r"^(?:[-*]\s*)?(.*\S.*)$", text, re.MULTILINE)
            prompts = [l.strip() for l in lines if l.strip() and not l.lower().startswith("prompt")]
            return prompts
        elif mode == "deep":
            # First, try to extract variants with or without asterisks
            variants = re.findall(
                r"(?:\*\*)?Variant (\d+)(?:\*\*)?:(.+?)(?=(?:\n(?:\*\*)?Variant \d+(?:\*\*)?:|$))", 
                text, 
                re.DOTALL
            )
            
            if not variants:
                # If no variants found, return the cleaned text
                return [clean_markdown_text(text)]
            
            # Clean each variant and format properly
            cleaned_variants = []
            for variant_num, variant_content in variants:
                if variant_content.strip():
                    variant_text = f"Variant {variant_num}:{variant_content}"
                    cleaned_variant = clean_markdown_text(variant_text)
                    cleaned_variants.append(cleaned_variant)
            
            return cleaned_variants if cleaned_variants else [clean_markdown_text(text)]
        else:
            # For few-shot and cot, clean and return the full text
            return [clean_markdown_text(text)]
    except Exception as e:
        print("Error in Gemini service:", e)
        return ["Sorry, something went wrong generating your prompt. Please try again."]