import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanPromptText(text: string): string {
  // Remove asterisk bullet points and replace with dashes
  text = text.replace(/^\s*\*\s+/gm, '- ')
  
  // Clean up variant headers (remove asterisks from variant labels)
  text = text.replace(/\*\*Variant (\d+):\*\*/g, 'Variant $1:')
  
  // Ensure consistent spacing after variant label
  text = text.replace(/(Variant \d+:)(\S)/g, '$1 $2')
  
  // Remove any remaining standalone asterisks
  text = text.replace(/(?<!\*)\*(?!\*)/g, '')
  
  // Remove double asterisks (bold markdown)
  text = text.replace(/\*\*(.*?)\*\*/g, '$1')
  
  return text
}

// Freemium Strategy Implementation
export interface UsageStats {
  dailyPrompts: number
  totalPrompts: number
  lastResetDate: string
  userTier: 'free' | 'pro' | 'enterprise'
  features: string[]
}

export interface UsageLimits {
  dailyPrompts: number
  totalPrompts: number
  features: string[]
  canAccessTemplates: boolean
  canAccessVideoPrompts: boolean
  canAccessCommercialTemplates: boolean
}

export const FREE_TIER_LIMITS: UsageLimits = {
  dailyPrompts: 5,
  totalPrompts: 50,
  features: ['basic', 'quick', 'deep'],
  canAccessTemplates: true,
  canAccessVideoPrompts: false,
  canAccessCommercialTemplates: false
}

export const PRO_TIER_LIMITS: UsageLimits = {
  dailyPrompts: 100,
  totalPrompts: -1, // unlimited
  features: ['basic', 'quick', 'deep', 'few-shot', 'cot', 'video'],
  canAccessTemplates: true,
  canAccessVideoPrompts: true,
  canAccessCommercialTemplates: true
}

export const ENTERPRISE_TIER_LIMITS: UsageLimits = {
  dailyPrompts: -1, // unlimited
  totalPrompts: -1, // unlimited
  features: ['basic', 'quick', 'deep', 'few-shot', 'cot', 'video'],
  canAccessTemplates: true,
  canAccessVideoPrompts: true,
  canAccessCommercialTemplates: true
}

export class UsageTracker {
  private static STORAGE_KEY = 'prompthero_usage'

  static getUsageStats(): UsageStats {
    if (typeof window === 'undefined') {
      return this.getDefaultStats()
    }

    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) {
      return this.getDefaultStats()
    }

    try {
      const stats = JSON.parse(stored) as UsageStats
      
      // Reset daily count if it's a new day
      const today = new Date().toDateString()
      if (stats.lastResetDate !== today) {
        stats.dailyPrompts = 0
        stats.lastResetDate = today
        this.saveUsageStats(stats)
      }

      return stats
    } catch (e) {
      console.error('Error parsing usage stats:', e)
      return this.getDefaultStats()
    }
  }

  static saveUsageStats(stats: UsageStats): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats))
    } catch (e) {
      console.error('Error saving usage stats:', e)
    }
  }

  static incrementUsage(): boolean {
    const stats = this.getUsageStats()
    const limits = this.getLimitsForTier(stats.userTier)

    // Check if user has reached daily limit
    if (limits.dailyPrompts !== -1 && stats.dailyPrompts >= limits.dailyPrompts) {
      return false
    }

    // Check if user has reached total limit
    if (limits.totalPrompts !== -1 && stats.totalPrompts >= limits.totalPrompts) {
      return false
    }

    // Increment counters
    stats.dailyPrompts++
    stats.totalPrompts++
    this.saveUsageStats(stats)

    return true
  }

  static getRemainingUsage(): { daily: number; total: number } {
    const stats = this.getUsageStats()
    const limits = this.getLimitsForTier(stats.userTier)

    const dailyRemaining = limits.dailyPrompts === -1 ? -1 : limits.dailyPrompts - stats.dailyPrompts
    const totalRemaining = limits.totalPrompts === -1 ? -1 : limits.totalPrompts - stats.totalPrompts

    return {
      daily: Math.max(0, dailyRemaining),
      total: Math.max(0, totalRemaining)
    }
  }

  static canUseFeature(feature: string): boolean {
    const stats = this.getUsageStats()
    const limits = this.getLimitsForTier(stats.userTier)

    return limits.features.includes(feature)
  }

  static getLimitsForTier(tier: 'free' | 'pro' | 'enterprise'): UsageLimits {
    switch (tier) {
      case 'pro':
        return PRO_TIER_LIMITS
      case 'enterprise':
        return ENTERPRISE_TIER_LIMITS
      default:
        return FREE_TIER_LIMITS
    }
  }

  static getUsagePercentage(): number {
    const stats = this.getUsageStats()
    const limits = this.getLimitsForTier(stats.userTier)

    if (limits.dailyPrompts === -1) return 0

    return (stats.dailyPrompts / limits.dailyPrompts) * 100
  }

  static resetUsage(): void {
    const defaultStats = this.getDefaultStats()
    this.saveUsageStats(defaultStats)
  }

  private static getDefaultStats(): UsageStats {
    return {
      dailyPrompts: 0,
      totalPrompts: 0,
      lastResetDate: new Date().toDateString(),
      userTier: 'free',
      features: FREE_TIER_LIMITS.features
    }
  }
}

// Pricing tiers
export interface PricingTier {
  id: string
  name: string
  price: number
  period: 'month' | 'year'
  features: string[]
  limits: UsageLimits
  popular?: boolean
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'month',
    features: [
      '5 prompts per day',
      'Basic templates',
      'Text prompts only',
      'Community support'
    ],
    limits: FREE_TIER_LIMITS
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    period: 'month',
    features: [
      '100 prompts per day',
      'All templates',
      'Video prompts',
      'Commercial templates',
      'Priority support'
    ],
    limits: PRO_TIER_LIMITS,
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    period: 'month',
    features: [
      'Unlimited prompts',
      'All features',
      'Team collaboration',
      'Custom integrations',
      'Dedicated support'
    ],
    limits: ENTERPRISE_TIER_LIMITS
  }
]

// Prompt History System
export interface PromptHistoryItem {
  id: string
  originalPrompt: string
  enhancedPrompt: string
  mode: string
  timestamp: number
  isFavorite: boolean
  tags: string[]
  successRating?: number
  category?: string
  templateUsed?: string
}

export interface PromptHistoryStats {
  totalPrompts: number
  favoriteCount: number
  avgSuccessRating: number
  topCategories: string[]
  topModes: string[]
  lastUsed: number
}

export class PromptHistory {
  private static STORAGE_KEY = 'prompthero_history'
  private static FAVORITES_KEY = 'prompthero_favorites'
  private static MAX_HISTORY = 1000 // Keep last 1000 prompts

  // Save a new prompt to history
  static savePrompt(item: Omit<PromptHistoryItem, 'id' | 'timestamp'>): string {
    if (typeof window === 'undefined') return ''

    const id = `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const historyItem: PromptHistoryItem = {
      id,
      timestamp: Date.now(),
      ...item
    }

    try {
      const history = this.getHistory()
      history.unshift(historyItem)
      
      // Keep only the most recent items
      if (history.length > this.MAX_HISTORY) {
        history.splice(this.MAX_HISTORY)
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history))
      return id
    } catch (e) {
      console.error('Error saving prompt to history:', e)
      return ''
    }
  }

  // Get all prompts from history
  static getHistory(): PromptHistoryItem[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      return JSON.parse(stored) as PromptHistoryItem[]
    } catch (e) {
      console.error('Error loading prompt history:', e)
      return []
    }
  }

  // Get paginated history
  static getHistoryPaginated(page: number = 1, limit: number = 20): {
    items: PromptHistoryItem[]
    total: number
    hasMore: boolean
  } {
    const history = this.getHistory()
    const start = (page - 1) * limit
    const end = start + limit

    return {
      items: history.slice(start, end),
      total: history.length,
      hasMore: end < history.length
    }
  }

  // Search prompts in history
  static searchHistory(query: string): PromptHistoryItem[] {
    const history = this.getHistory()
    const searchTerm = query.toLowerCase()

    return history.filter(item =>
      item.originalPrompt.toLowerCase().includes(searchTerm) ||
      item.enhancedPrompt.toLowerCase().includes(searchTerm) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      item.category?.toLowerCase().includes(searchTerm)
    )
  }

  // Get favorites
  static getFavorites(): PromptHistoryItem[] {
    return this.getHistory().filter(item => item.isFavorite)
  }

  // Toggle favorite status
  static toggleFavorite(id: string): boolean {
    try {
      const history = this.getHistory()
      const item = history.find(h => h.id === id)
      
      if (!item) return false

      item.isFavorite = !item.isFavorite
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history))
      return item.isFavorite
    } catch (e) {
      console.error('Error toggling favorite:', e)
      return false
    }
  }

  // Delete a prompt from history
  static deletePrompt(id: string): boolean {
    try {
      const history = this.getHistory()
      const index = history.findIndex(h => h.id === id)
      
      if (index === -1) return false

      history.splice(index, 1)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history))
      return true
    } catch (e) {
      console.error('Error deleting prompt:', e)
      return false
    }
  }

  // Rate a prompt (1-5 stars)
  static ratePrompt(id: string, rating: number): boolean {
    try {
      const history = this.getHistory()
      const item = history.find(h => h.id === id)
      
      if (!item) return false

      item.successRating = Math.max(1, Math.min(5, rating))
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history))
      return true
    } catch (e) {
      console.error('Error rating prompt:', e)
      return false
    }
  }

  // Get history statistics
  static getStats(): PromptHistoryStats {
    const history = this.getHistory()
    
    if (history.length === 0) {
      return {
        totalPrompts: 0,
        favoriteCount: 0,
        avgSuccessRating: 0,
        topCategories: [],
        topModes: [],
        lastUsed: 0
      }
    }

    const favoriteCount = history.filter(h => h.isFavorite).length
    const ratedPrompts = history.filter(h => h.successRating !== undefined)
    const avgSuccessRating = ratedPrompts.length > 0 
      ? ratedPrompts.reduce((sum, h) => sum + (h.successRating || 0), 0) / ratedPrompts.length
      : 0

    // Count categories and modes
    const categoryCount: Record<string, number> = {}
    const modeCount: Record<string, number> = {}

    history.forEach(item => {
      if (item.category) {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
      }
      modeCount[item.mode] = (modeCount[item.mode] || 0) + 1
    })

    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category)

    const topModes = Object.entries(modeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([mode]) => mode)

    return {
      totalPrompts: history.length,
      favoriteCount,
      avgSuccessRating,
      topCategories,
      topModes,
      lastUsed: history[0]?.timestamp || 0
    }
  }

  // Clear all history
  static clearHistory(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (e) {
      console.error('Error clearing history:', e)
    }
  }

  // Export history as JSON
  static exportHistory(): string {
    const history = this.getHistory()
    return JSON.stringify(history, null, 2)
  }

  // Import history from JSON
  static importHistory(jsonData: string): boolean {
    try {
      const importedHistory = JSON.parse(jsonData) as PromptHistoryItem[]
      
      // Validate structure
      if (!Array.isArray(importedHistory)) return false

      // Merge with existing history
      const currentHistory = this.getHistory()
      const mergedHistory = [...importedHistory, ...currentHistory]
      
      // Remove duplicates based on content
      const uniqueHistory = mergedHistory.filter((item, index, arr) => 
        arr.findIndex(h => h.originalPrompt === item.originalPrompt && h.enhancedPrompt === item.enhancedPrompt) === index
      )

      // Sort by timestamp (newest first)
      uniqueHistory.sort((a, b) => b.timestamp - a.timestamp)

      // Keep only MAX_HISTORY items
      if (uniqueHistory.length > this.MAX_HISTORY) {
        uniqueHistory.splice(this.MAX_HISTORY)
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(uniqueHistory))
      return true
    } catch (e) {
      console.error('Error importing history:', e)
      return false
    }
  }
}

// Performance Analytics System
export interface PerformanceMetrics {
  totalPrompts: number
  successRate: number
  avgRating: number
  topPerformingModes: { mode: string; success: number; count: number }[]
  topPerformingCategories: { category: string; success: number; count: number }[]
  improvementSuggestions: string[]
  trends: {
    dailySuccess: { date: string; success: number }[]
    modePerformance: { mode: string; performance: number }[]
  }
}

export class PerformanceAnalytics {
  // Calculate overall performance metrics
  static getPerformanceMetrics(): PerformanceMetrics {
    const history = PromptHistory.getHistory()
    
    if (history.length === 0) {
      return {
        totalPrompts: 0,
        successRate: 0,
        avgRating: 0,
        topPerformingModes: [],
        topPerformingCategories: [],
        improvementSuggestions: [],
        trends: {
          dailySuccess: [],
          modePerformance: []
        }
      }
    }

    // Calculate basic metrics
    const totalPrompts = history.length
    const ratedPrompts = history.filter(p => p.successRating !== undefined)
    const avgRating = ratedPrompts.length > 0 
      ? ratedPrompts.reduce((sum, p) => sum + (p.successRating || 0), 0) / ratedPrompts.length
      : 0
    
    // Consider prompts with rating >= 4 as successful
    const successfulPrompts = ratedPrompts.filter(p => (p.successRating || 0) >= 4)
    const successRate = ratedPrompts.length > 0 ? (successfulPrompts.length / ratedPrompts.length) * 100 : 0

    // Calculate mode performance
    const modeStats: Record<string, { success: number; count: number }> = {}
    ratedPrompts.forEach(prompt => {
      if (!modeStats[prompt.mode]) {
        modeStats[prompt.mode] = { success: 0, count: 0 }
      }
      modeStats[prompt.mode].count++
      if ((prompt.successRating || 0) >= 4) {
        modeStats[prompt.mode].success++
      }
    })

    const topPerformingModes = Object.entries(modeStats)
      .map(([mode, stats]) => ({
        mode,
        success: stats.count > 0 ? (stats.success / stats.count) * 100 : 0,
        count: stats.count
      }))
      .sort((a, b) => b.success - a.success)
      .slice(0, 5)

    // Calculate category performance
    const categoryStats: Record<string, { success: number; count: number }> = {}
    ratedPrompts.forEach(prompt => {
      if (prompt.category) {
        if (!categoryStats[prompt.category]) {
          categoryStats[prompt.category] = { success: 0, count: 0 }
        }
        categoryStats[prompt.category].count++
        if ((prompt.successRating || 0) >= 4) {
          categoryStats[prompt.category].success++
        }
      }
    })

    const topPerformingCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        success: stats.count > 0 ? (stats.success / stats.count) * 100 : 0,
        count: stats.count
      }))
      .sort((a, b) => b.success - a.success)
      .slice(0, 5)

    // Generate improvement suggestions
    const improvementSuggestions = this.generateImprovementSuggestions(
      history,
      modeStats,
      categoryStats,
      successRate,
      avgRating
    )

    // Calculate trends
    const dailySuccess = this.calculateDailyTrends(history)
    const modePerformance = topPerformingModes.map(m => ({
      mode: m.mode,
      performance: m.success
    }))

    return {
      totalPrompts,
      successRate,
      avgRating,
      topPerformingModes,
      topPerformingCategories,
      improvementSuggestions,
      trends: {
        dailySuccess,
        modePerformance
      }
    }
  }

  // Generate personalized improvement suggestions
  private static generateImprovementSuggestions(
    history: PromptHistoryItem[],
    modeStats: Record<string, { success: number; count: number }>,
    categoryStats: Record<string, { success: number; count: number }>,
    successRate: number,
    avgRating: number
  ): string[] {
    const suggestions: string[] = []
    
    // Success rate based suggestions
    if (successRate < 60) {
      suggestions.push("Your success rate is below average. Try using more specific and detailed prompts.")
    } else if (successRate >= 80) {
      suggestions.push("Excellent success rate! You're creating high-quality prompts.")
    }

    // Rating based suggestions
    if (avgRating < 3.5) {
      suggestions.push("Consider using templates or following prompt engineering best practices to improve quality.")
    }

    // Mode performance suggestions
    const bestMode = Object.entries(modeStats)
      .filter(([_, stats]) => stats.count >= 3)
      .sort(([_, a], [__, b]) => (b.success / b.count) - (a.success / a.count))[0]
    
    if (bestMode) {
      suggestions.push(`Your best performing mode is "${bestMode[0]}". Consider using it more often.`)
    }

    const worstMode = Object.entries(modeStats)
      .filter(([_, stats]) => stats.count >= 3)
      .sort(([_, a], [__, b]) => (a.success / a.count) - (b.success / b.count))[0]
    
    if (worstMode && (worstMode[1].success / worstMode[1].count) < 0.5) {
      suggestions.push(`Consider improving your "${worstMode[0]}" prompts with more context and examples.`)
    }

    // Category suggestions
    const bestCategory = Object.entries(categoryStats)
      .filter(([_, stats]) => stats.count >= 2)
      .sort(([_, a], [__, b]) => (b.success / b.count) - (a.success / a.count))[0]
    
    if (bestCategory) {
      suggestions.push(`You excel at "${bestCategory[0]}" prompts. Consider specializing in this area.`)
    }

    // General suggestions
    if (history.length >= 10) {
      const recentPrompts = history.slice(0, 5)
      const recentRating = recentPrompts
        .filter(p => p.successRating !== undefined)
        .reduce((sum, p) => sum + (p.successRating || 0), 0) / recentPrompts.length
      
      if (recentRating > avgRating) {
        suggestions.push("Your recent prompts are improving! Keep up the good work.")
      } else if (recentRating < avgRating) {
        suggestions.push("Your recent prompts could be better. Review your top-rated prompts for inspiration.")
      }
    }

    // Template usage suggestions
    const templateUsage = history.filter(p => p.templateUsed).length
    if (templateUsage / history.length < 0.3) {
      suggestions.push("Try using more templates to improve consistency and quality.")
    }

    return suggestions.slice(0, 5) // Return top 5 suggestions
  }

  // Calculate daily success trends
  private static calculateDailyTrends(history: PromptHistoryItem[]): { date: string; success: number }[] {
    const dailyData: Record<string, { success: number; total: number }> = {}
    
    history.forEach(prompt => {
      if (prompt.successRating !== undefined) {
        const date = new Date(prompt.timestamp).toISOString().split('T')[0]
        if (!dailyData[date]) {
          dailyData[date] = { success: 0, total: 0 }
        }
        dailyData[date].total++
        if (prompt.successRating >= 4) {
          dailyData[date].success++
        }
      }
    })

    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        success: data.total > 0 ? (data.success / data.total) * 100 : 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30) // Last 30 days
  }

  // Get optimization suggestions for a specific prompt
  static getPromptOptimizationSuggestions(originalPrompt: string, mode: string): string[] {
    const suggestions: string[] = []
    
    // Length analysis
    if (originalPrompt.length < 20) {
      suggestions.push("Your prompt is quite short. Add more context and specific requirements.")
    } else if (originalPrompt.length > 500) {
      suggestions.push("Your prompt is very long. Consider breaking it into smaller, focused requests.")
    }

    // Mode-specific suggestions
    switch (mode) {
      case 'deep':
        if (!originalPrompt.includes('example') && !originalPrompt.includes('detail')) {
          suggestions.push("For deep mode, include examples or request detailed explanations.")
        }
        break
      case 'few-shot':
        if (!originalPrompt.includes('example')) {
          suggestions.push("Few-shot mode works better with specific examples in your prompt.")
        }
        break
      case 'cot':
        if (!originalPrompt.includes('step') && !originalPrompt.includes('process')) {
          suggestions.push("Chain-of-thought works best when you ask for step-by-step reasoning.")
        }
        break
      case 'video':
        if (!originalPrompt.includes('visual') && !originalPrompt.includes('scene')) {
          suggestions.push("Video prompts should include visual descriptions and scene details.")
        }
        break
    }

    // General quality suggestions
    if (!/[?!.]$/.test(originalPrompt.trim())) {
      suggestions.push("End your prompt with clear punctuation to indicate completion.")
    }

    if (originalPrompt.toLowerCase().includes('write me') || originalPrompt.toLowerCase().includes('create me')) {
      suggestions.push("Be more specific about what you want instead of just asking to 'write me' something.")
    }

    return suggestions
  }

  // Compare performance across different periods
  static comparePerformance(days: number = 30): {
    current: PerformanceMetrics
    previous: PerformanceMetrics
    improvement: number
  } {
    const currentMetrics = this.getPerformanceMetrics()
    
    // For demonstration, return mock comparison
    // In a real implementation, you'd filter history by date ranges
    const previousMetrics = {
      ...currentMetrics,
      successRate: Math.max(0, currentMetrics.successRate - 5),
      avgRating: Math.max(0, currentMetrics.avgRating - 0.3)
    }

    const improvement = currentMetrics.successRate - previousMetrics.successRate

    return {
      current: currentMetrics,
      previous: previousMetrics,
      improvement
    }
  }
}

export class PromptMarketplace {
  private static readonly MARKETPLACE_KEY = 'prompthero_marketplace'
  private static readonly SHARED_TEMPLATES_KEY = 'prompthero_shared_templates'
  
  static getSharedTemplates(): MarketplaceTemplate[] {
    try {
      const data = localStorage.getItem(this.SHARED_TEMPLATES_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error loading shared templates:', error)
      return []
    }
  }
  
  static saveSharedTemplate(template: Omit<MarketplaceTemplate, 'id' | 'createdAt' | 'rating' | 'ratingCount' | 'downloads' | 'likes' | 'views' | 'isLiked'>): MarketplaceTemplate {
    const templates = this.getSharedTemplates()
    const newTemplate: MarketplaceTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      rating: 0,
      ratingCount: 0,
      downloads: 0,
      likes: 0,
      views: 0,
      isLiked: false
    }
    
    templates.unshift(newTemplate)
    localStorage.setItem(this.SHARED_TEMPLATES_KEY, JSON.stringify(templates))
    return newTemplate
  }
  
  static rateTemplate(templateId: string, rating: number): void {
    const templates = this.getSharedTemplates()
    const template = templates.find(t => t.id === templateId)
    if (template) {
      // Simple rating system - in real app would be more sophisticated
      template.rating = ((template.rating * template.ratingCount) + rating) / (template.ratingCount + 1)
      template.ratingCount += 1
      localStorage.setItem(this.SHARED_TEMPLATES_KEY, JSON.stringify(templates))
    }
  }
  
  static likeTemplate(templateId: string, isLiked: boolean): void {
    const templates = this.getSharedTemplates()
    const template = templates.find(t => t.id === templateId)
    if (template) {
      template.isLiked = isLiked
      template.likes += isLiked ? 1 : -1
      localStorage.setItem(this.SHARED_TEMPLATES_KEY, JSON.stringify(templates))
    }
  }
  
  static downloadTemplate(templateId: string): void {
    const templates = this.getSharedTemplates()
    const template = templates.find(t => t.id === templateId)
    if (template) {
      template.downloads += 1
      localStorage.setItem(this.SHARED_TEMPLATES_KEY, JSON.stringify(templates))
    }
  }
  
  static viewTemplate(templateId: string): void {
    const templates = this.getSharedTemplates()
    const template = templates.find(t => t.id === templateId)
    if (template) {
      template.views += 1
      localStorage.setItem(this.SHARED_TEMPLATES_KEY, JSON.stringify(templates))
    }
  }
  
  static searchTemplates(query: string, category?: string, sortBy?: string): MarketplaceTemplate[] {
    const templates = this.getSharedTemplates()
    let filtered = templates
    
    if (query) {
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(query.toLowerCase()) ||
        template.description.toLowerCase().includes(query.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
    }
    
    if (category && category !== 'All Categories') {
      filtered = filtered.filter(template => template.category === category)
    }
    
    if (sortBy) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'recent':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          case 'rating':
            return b.rating - a.rating
          case 'downloads':
            return b.downloads - a.downloads
          case 'popular':
          default:
            return (b.likes + b.downloads + b.views) - (a.likes + a.downloads + a.views)
        }
      })
    }
    
    return filtered
  }
  
  static getPopularTemplates(limit: number = 10): MarketplaceTemplate[] {
    const templates = this.getSharedTemplates()
    return templates
      .sort((a, b) => (b.likes + b.downloads + b.views) - (a.likes + a.downloads + a.views))
      .slice(0, limit)
  }
  
  static getFeaturedTemplates(): MarketplaceTemplate[] {
    const templates = this.getSharedTemplates()
    return templates.filter(template => template.rating >= 4.5 && template.downloads > 50)
  }
  
  static getTemplatesByAuthor(author: string): MarketplaceTemplate[] {
    const templates = this.getSharedTemplates()
    return templates.filter(template => template.author === author)
  }
  
  static getTemplatesByCategory(category: string): MarketplaceTemplate[] {
    const templates = this.getSharedTemplates()
    return templates.filter(template => template.category === category)
  }
  
  static exportTemplates(): string {
    const templates = this.getSharedTemplates()
    return JSON.stringify(templates, null, 2)
  }
  
  static importTemplates(templatesJson: string): boolean {
    try {
      const templates = JSON.parse(templatesJson)
      if (Array.isArray(templates)) {
        localStorage.setItem(this.SHARED_TEMPLATES_KEY, JSON.stringify(templates))
        return true
      }
      return false
    } catch (error) {
      console.error('Error importing templates:', error)
      return false
    }
  }
  
  static clearAllTemplates(): void {
    localStorage.removeItem(this.SHARED_TEMPLATES_KEY)
  }
  
  static getMarketplaceStats(): MarketplaceStats {
    const templates = this.getSharedTemplates()
    return {
      totalTemplates: templates.length,
      totalDownloads: templates.reduce((sum, t) => sum + t.downloads, 0),
      totalLikes: templates.reduce((sum, t) => sum + t.likes, 0),
      totalViews: templates.reduce((sum, t) => sum + t.views, 0),
      averageRating: templates.length > 0 ? templates.reduce((sum, t) => sum + t.rating, 0) / templates.length : 0,
      activeContributors: new Set(templates.map(t => t.author)).size,
      categoryCounts: templates.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }
}
