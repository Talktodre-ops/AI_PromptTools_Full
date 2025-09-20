import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanPromptText(text: string): string {
  // First, remove any markdown-style formatting like bold/italics
  let cleaned = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');

  // Then, remove backticks and the word "prompt"
  cleaned = cleaned.replace(/`/g, "").replace(/markdown/gi, "").replace(/prompt:/gi, "");

  if (cleaned.toLowerCase().includes("/imagine")) {
      const imagineIndex = cleaned.toLowerCase().indexOf("/imagine");
      cleaned = cleaned.substring(imagineIndex);
  } else {
      const commonGreetings = ["here's a prompt", "here is a prompt", "here's your prompt", "here is your prompt"];
      for (const greeting of commonGreetings) {
          if (cleaned.toLowerCase().startsWith(greeting)) {
              cleaned = cleaned.substring(greeting.length).trim();
              break;
          }
      }
  }

  // Finally, remove any remaining standalone asterisks
  cleaned = cleaned.replace(/\*/g, '');

  return cleaned.trim();
}

// Video platform configurations
export const VIDEO_PLATFORMS = {
  runway: {
    name: "Runway ML",
    icon: "🎬",
    maxLength: 500,
    features: ["Motion", "Camera Movement", "Style Transfer"],
    promptStructure: "Scene description + Camera movement + Style/mood"
  },
  pika: {
    name: "Pika Labs",
    icon: "🎭",
    maxLength: 300,
    features: ["Text-to-Video", "Image-to-Video", "Effects"],
    promptStructure: "Visual description + Motion + Duration"
  },
  sora: {
    name: "OpenAI Sora",
    icon: "🌟",
    maxLength: 400,
    features: ["Cinematic Quality", "Complex Scenes", "Realistic Physics"],
    promptStructure: "Detailed scene + Camera work + Cinematic style"
  },
  general: {
    name: "General Video AI",
    icon: "🎥",
    maxLength: 350,
    features: ["Universal Format", "Basic Motions", "Simple Scenes"],
    promptStructure: "Basic description + Movement + Style"
  }
}

// Image generation helper
export function generateImagePrompt(description: string, style?: string): string {
  const styleModifier = style ? `, ${style} style` : '';
  return `${description}${styleModifier}, high quality, detailed, professional`;
}

// Prompt optimization utilities
export function optimizePrompt(prompt: string, mode: string): string {
  switch (mode) {
    case 'basic':
      return prompt.trim();
    case 'detailed':
      return `${prompt.trim()}. Please provide detailed, comprehensive information with examples and explanations.`;
    case 'creative':
      return `${prompt.trim()}. Be creative, imaginative, and think outside the box in your response.`;
    case 'technical':
      return `${prompt.trim()}. Provide technical details, specifications, and precise information.`;
    default:
      return prompt.trim();
  }
}

// PromptMarketplace utility class
export class PromptMarketplace {
  static searchPrompts(prompts: any[], query: string) {
    if (!query.trim()) return prompts;

    const searchTerm = query.toLowerCase();
    return prompts.filter(prompt =>
      prompt.title?.toLowerCase().includes(searchTerm) ||
      prompt.description?.toLowerCase().includes(searchTerm) ||
      prompt.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm))
    );
  }

  static filterByCategory(prompts: any[], category: string) {
    if (category === 'All Categories' || !category) return prompts;
    return prompts.filter(prompt => prompt.category === category);
  }

  static sortPrompts(prompts: any[], sortBy: string) {
    switch (sortBy) {
      case 'popular':
        return [...prompts].sort((a, b) => (b.likes + b.downloads) - (a.likes + a.downloads));
      case 'recent':
        return [...prompts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'rating':
        return [...prompts].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'downloads':
        return [...prompts].sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
      default:
        return prompts;
    }
  }
}