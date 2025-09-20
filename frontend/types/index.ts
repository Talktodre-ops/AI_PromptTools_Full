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

export interface MarketplaceTemplate {
  id: string
  title: string
  description: string
  content: string
  category: string
  mode: string
  tags: string[]
  author: string
  authorAvatar: string
  rating: number
  ratingCount: number
  downloads: number
  likes: number
  views: number
  createdAt: string
  isLiked: boolean
  isPremium: boolean
}

export interface MarketplaceStats {
  totalTemplates: number
  totalDownloads: number
  activeContributors: number
  averageRating: number
}