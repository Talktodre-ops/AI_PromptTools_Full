from pydantic import BaseModel

class PromptRequest(BaseModel):
    raw_input: str
    mode: str = "deep"
    tone: str = "default"
    persona: str = ""
    return_format: str = "plain"
