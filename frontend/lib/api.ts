import { toast } from "@/components/ui/use-toast"

// Remove these imports since we're declaring them here
// import type { PromptResponse, PromptRequest } from "@/types"

export interface PromptRequest {
  raw_input: string
  mode: string
  tone: string
  persona: string
  return_format: string  // Changed from format to match your form data
}

export interface PromptResponse {
  refined_prompts: string[]  // Changed to match the API response
}

interface ApiError {
  message: string;
  status?: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchFromApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    return { error: 'Failed to fetch data from API' };
  }
}

// Typed API functions
export async function generatePrompts(payload: PromptRequest): Promise<ApiResponse<PromptResponse>> {
  return fetchFromApi<PromptResponse>('/refine', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function explainPrompt(prompt: string) {
  return fetchFromApi("/explain", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
}
