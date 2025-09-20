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

export interface VideoPromptRequest {
  raw_input: string
  camera_angle: string
  lighting: string
  movement: string
  style: string
  tone: string
  return_format: string
  // Enhanced fields
  tool_type?: string
  quality?: string
  commercial_type?: string
  context_details?: string
}

export interface QuickVideoPromptRequest {
  raw_input: string
  template_type: string
}

export interface PromptResponse {
  refined_prompts: string[]  // Changed to match the API response
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

// Default to localhost:8000 if environment variable isn't set
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchFromApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`
  console.log('Fetching from:', url) // Debug log

  // Retrieve JWT token from localStorage if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  // Build headers object with known string-to-string mapping
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
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

export async function login(
  email: string,
  password: string
): Promise<void> {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)

  const response = await fetchFromApi<TokenResponse>('/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })

  localStorage.setItem('token', response.access_token)
}
