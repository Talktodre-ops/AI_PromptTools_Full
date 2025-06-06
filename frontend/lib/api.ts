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

// Default to localhost:8000 if environment variable isn't set
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchFromApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  // Use the constant defined above instead of directly accessing process.env
  const url = `${API_URL}${endpoint}`
  console.log('Fetching from:', url) // Debug log

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('API Error:', error) // Debug log
    throw new Error(`API Error: ${response.status} - ${error}`)
  }

  return response.json()
}

// Typed API functions
export async function generatePrompts(payload: PromptRequest): Promise<PromptResponse> {
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
