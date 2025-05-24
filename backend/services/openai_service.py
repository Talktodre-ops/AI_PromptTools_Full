import os
import openai

SYSTEM_PROMPT = (
    "Refine this input into a high-quality prompt that could be used in an AI assistant. "
    "Include task intent, format instructions, and constraints. Generate 2–3 prompt variants."
)

openai.api_key = os.getenv("OPENAI_API_KEY")

async def generate_refined_prompts(raw_input: str):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": raw_input}
        ],
        n=3,
        max_tokens=200,
    )
    return [choice["message"]["content"] for choice in response["choices"]]