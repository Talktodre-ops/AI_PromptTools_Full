import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'placeholder-url'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Only create client if we have real credentials
export const supabase = (supabaseUrl === 'placeholder-url' || supabaseAnonKey === 'placeholder-key')
  ? null
  : createClient(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

export interface PromptGalleryData {
  id: number
  'prompt-title': string
  'prompt-content': string
  category?: string
  rating?: number
  rating_count?: number
  usage_count?: number
}

export interface RatingResponse {
  average_rating: number
  rating_count: number
  user_rating: number
}

// Fetch all prompts from prompt_gallery table
export async function fetchGalleryPrompts(): Promise<PromptGalleryData[]> {
  try {
    const { data, error } = await supabase
      .from('prompt_gallery')
      .select('*')
      .order('id')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching gallery prompts:', error)
    return []
  }
}

// Search prompts by title or content
export async function searchGalleryPrompts(searchQuery: string = ''): Promise<PromptGalleryData[]> {
  try {
    if (!searchQuery.trim()) {
      return await fetchGalleryPrompts()
    }

    const { data, error } = await supabase
      .from('prompt_gallery')
      .select('*')
      .or(`prompt-title.ilike.%${searchQuery}%,prompt-content.ilike.%${searchQuery}%`)
      .order('id')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error searching gallery prompts:', error)
    return []
  }
}

// Copy prompt to clipboard (simplified)
export async function copyPromptToClipboard(promptContent: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(promptContent)
    return true
  } catch (error) {
    console.error('Error copying prompt:', error)
    return false
  }
}

// Toggle favorite status
export async function toggleFavorite(promptId: string): Promise<boolean | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User must be authenticated to favorite prompts')
    }

    const { data, error } = await supabase.rpc('toggle_favorite', {
      prompt_id: promptId,
      user_id: user.id
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return null
  }
}

// Track prompt usage
export async function trackPromptUsage(promptId: string, platform: string = 'web'): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.rpc('increment_prompt_usage', {
      prompt_id: promptId,
      user_id: user?.id || null,
      platform: platform
    })

    if (error) throw error
  } catch (error) {
    console.error('Error tracking usage:', error)
  }
}

// Get user-specific prompt data
export async function getUserPromptData(promptId: string): Promise<any> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase.rpc('get_user_prompt_data', {
      user_id: user.id,
      prompt_id: promptId
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting user prompt data:', error)
    return null
  }
}

// Extract categories from prompt titles dynamically
export function extractCategoriesFromTitles(prompts: PromptGalleryData[]): Array<{ name: string; count: number }> {
  const categoryMap = new Map<string, number>()

  prompts.forEach(prompt => {
    const title = prompt['prompt-title']
    let category = 'General'

    // Extract category from "Act as a..." or "Act as an..." patterns
    const actAsMatch = title.match(/^Act as an? (.+?)(?:\s|$)/i)
    if (actAsMatch) {
      category = actAsMatch[1].trim()
    } else {
      // Try other patterns
      const roleMatch = title.match(/^(\w+(?:\s+\w+){0,2})(?:\s|$)/i)
      if (roleMatch) {
        category = roleMatch[1].trim()
      }
    }

    // Clean up category name
    category = category.replace(/[^a-zA-Z0-9\s]/g, '').trim()
    if (category.length > 50) category = category.substring(0, 50)
    if (!category) category = 'General'

    categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
  })

  // Convert to array and sort by count (descending)
  const categories = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // Add "All Prompts" at the beginning
  return [{ name: 'All Prompts', count: prompts.length }, ...categories]
}

// Real-time subscription for prompt ratings
export function subscribeToPromptRatings(promptId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`prompt_ratings:${promptId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'prompt_ratings',
        filter: `prompt_id=eq.${promptId}`
      },
      callback
    )
    .subscribe()
}

// Authentication helpers
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}