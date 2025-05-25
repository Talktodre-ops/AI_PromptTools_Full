export interface PromptFormProps {
  onResults: (results: string[]) => void;
}

export interface PromptResultsProps {
  results: string[];
}

export interface WelcomePageProps {
  onStart: () => void;
}

export interface Prompt {
  id: string;
  prompt: string;
  explanation?: string;
}

export interface PromptResponse {
  refined_prompts: string[]; // Changed from refined_prompt to match API response
}

export interface PromptRequest {
  raw_input: string;
  mode: string;
  tone: string;
  persona: string;
  return_format: string;
}