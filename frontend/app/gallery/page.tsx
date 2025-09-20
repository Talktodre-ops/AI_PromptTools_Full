"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, Copy, ExternalLink, ArrowLeft, TrendingUp, Linkedin, Twitter, Instagram, Mail, Github } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from "@/lib/utils"
import { supabase, isSupabaseConfigured } from '@/lib/supabase-client'

interface PromptGalleryData {
  id: number
  'prompt-title': string
  'prompt-content': string
  views?: number
  likes?: number
  rating?: number
  rating_count?: number
  created_at?: string
  updated_at?: string
}

// Sample data structure for demonstration
const samplePrompts: PromptGalleryData[] = [
  {
    id: 1,
    'prompt-title': 'Act as an Ethereum Developer',
    'prompt-content': 'Imagine you are an experienced Ethereum developer tasked with creating a smart contract for a blockchain messenger. The objective is to save messages on the blockchain, making them readable (public) to everyone, readable (private) to only the person who deployed the contract, and to count how many times the message was updated. Develop a secure and user-friendly smart contract for this purpose, including the necessary functions and considerations for gas optimization and security.'
  },
  {
    id: 2,
    'prompt-title': 'Act as a Linux Terminal',
    'prompt-content': 'I want you to act as a linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. do not write explanations. do not type commands unless I instruct you to do so. when i need to tell you something in english, i will do so by putting text inside curly brackets {like this}. my first command is pwd'
  },
  {
    id: 3,
    'prompt-title': 'Act as an English Translator and Improver',
    'prompt-content': 'I want you to act as an English translator, spelling corrector and improver. I will speak to you in any language and you will detect the language, translate it and answer in the corrected and improved version of my text, in English. I want you to replace my simplified A0-level words and sentences with more beautiful and elegant, upper level English words and sentences. Keep the meaning same, but make them more literary. I want you to only reply the correction, the improvements and nothing else, do not write explanations.'
  }
]

export default function GalleryPage() {
  const [prompts, setPrompts] = useState<PromptGalleryData[]>([])
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Prompts')
  const [selectedAI, setSelectedAI] = useState<string | null>(null)
  const [copiedPrompts, setCopiedPrompts] = useState<Set<number>>(new Set())
  const [likedPrompts, setLikedPrompts] = useState<Set<number>>(new Set())

  // Extract categories from prompt titles
  const extractCategoriesFromTitles = (prompts: PromptGalleryData[]): Array<{ name: string; count: number }> => {
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

  // Initialize selected AI from localStorage
  useEffect(() => {
    const savedAI = localStorage.getItem('selectedAI')
    if (savedAI) {
      try {
        const aiData = JSON.parse(savedAI)
        setSelectedAI(aiData.name)
      } catch (e) {
        setSelectedAI('ChatGPT') // Default fallback
      }
    } else {
      setSelectedAI('ChatGPT') // Default fallback
    }
  }, [])

  // Simulate database fetch
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        setLoading(true)

        // If Supabase isn't configured, fallback to sample data
        if (!isSupabaseConfigured() || !supabase) {
          const fallbackData = samplePrompts
          setPrompts(fallbackData)
          const extractedCategories = extractCategoriesFromTitles(fallbackData)
          setCategories(extractedCategories)
          toast.message('Supabase not configured. Using sample data.')
          return
        }

        // Fetch real data from Supabase - optimized query
        const { data, error } = await supabase
          .from('prompt-gallery')
          .select('id, "prompt-title", "prompt-content", views, likes, rating, rating_count, created_at')
          .order('id')
          .limit(500) // Limit initial load for performance

        if (error) {
          console.error('Supabase error details:', error)
          console.error('Error message:', error.message)
          console.error('Error code:', error.code)
          toast.error(`Database error: ${error.message || 'Unknown error'}`)

          // Don't fallback to sample data - show empty state instead
          setPrompts([])
          setCategories([{ name: 'All Prompts', count: 0 }])
        } else {
          // Use real database data
          const realData = data || []
          setPrompts(realData)

          // Generate categories from prompt titles
          const extractedCategories = extractCategoriesFromTitles(realData)
          setCategories(extractedCategories)

          toast.success(`✅ Loaded ${realData.length} prompts from Supabase database`)
        }
      } catch (error) {
        console.error('Error loading prompts:', error)
        toast.error('Failed to load prompts from database')
      } finally {
        setLoading(false)
      }
    }

    loadPrompts()
  }, [])

  // Optimized filtering with useMemo
  const filteredPrompts = useMemo(() => {
    let filtered = prompts

    // Filter by category
    if (selectedCategory !== 'All Prompts') {
      filtered = prompts.filter(prompt => {
        const title = prompt['prompt-title']
        const actAsMatch = title.match(/^Act as an? (.+?)(?:\s|$)/i)
        if (actAsMatch) {
          const category = actAsMatch[1].trim().replace(/[^a-zA-Z0-9\s]/g, '').trim()
          return category === selectedCategory
        }
        return false
      })
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(prompt =>
        prompt['prompt-title'].toLowerCase().includes(query) ||
        prompt['prompt-content'].toLowerCase().includes(query)
      )
    }

    return filtered
  }, [prompts, selectedCategory, searchQuery])

  const handleCopyPrompt = useCallback(async (prompt: PromptGalleryData) => {
    try {
      await navigator.clipboard.writeText(prompt['prompt-content'])

      // Add visual feedback
      setCopiedPrompts(prev => new Set(prev).add(prompt.id))
      toast.success('Prompt copied to clipboard!')

      // Remove visual feedback after 2 seconds
      setTimeout(() => {
        setCopiedPrompts(prev => {
          const newSet = new Set(prev)
          newSet.delete(prompt.id)
          return newSet
        })
      }, 2000)
    } catch (error) {
      toast.error('Failed to copy prompt')
    }
  }, [])

  const handleLikePrompt = useCallback(async (prompt: PromptGalleryData) => {
    try {
      const isLiked = likedPrompts.has(prompt.id)

      if (isLiked) {
        // Unlike the prompt
        setLikedPrompts(prev => {
          const newSet = new Set(prev)
          newSet.delete(prompt.id)
          return newSet
        })

        // Update the prompt likes count locally
        setPrompts(prev => prev.map(p =>
          p.id === prompt.id
            ? { ...p, likes: Math.max((p.likes || 0) - 1, 0) }
            : p
        ))

        toast.success('Removed from favorites')
      } else {
        // Like the prompt
        setLikedPrompts(prev => new Set(prev).add(prompt.id))

        // Update the prompt likes count locally
        setPrompts(prev => prev.map(p =>
          p.id === prompt.id
            ? { ...p, likes: (p.likes || 0) + 1 }
            : p
        ))

        toast.success('Added to favorites!')
      }

      // TODO: Update database with likes
      // You can implement the database update here using the toggle_prompt_favorite function

    } catch (error) {
      toast.error('Failed to update likes')
    }
  }, [likedPrompts])

  const handleOpenWithAI = useCallback((prompt: PromptGalleryData) => {
    const selectedAI = localStorage.getItem('selectedAI')
    let aiData = { name: 'ChatGPT', url: 'https://chat.openai.com/' }

    if (selectedAI) {
      try {
        aiData = JSON.parse(selectedAI)
      } catch (e) {
        console.error('Failed to parse selected AI:', e)
      }
    }

    // URL encode the prompt content
    const encodedPrompt = encodeURIComponent(prompt['prompt-content'])

    // Create AI-specific URLs with the prompt
    let finalUrl = aiData.url

    switch (aiData.name) {
      case 'ChatGPT':
        finalUrl = `https://chat.openai.com/?q=${encodedPrompt}`
        break
      case 'Claude':
        finalUrl = `https://claude.ai/chat?q=${encodedPrompt}`
        break
      case 'Gemini':
        finalUrl = `https://gemini.google.com/app?q=${encodedPrompt}`
        break
      case 'Perplexity':
        finalUrl = `https://www.perplexity.ai/?q=${encodedPrompt}`
        break
      case 'Copilot':
        finalUrl = `https://copilot.microsoft.com/?q=${encodedPrompt}`
        break
      case 'Meta AI':
        finalUrl = `https://www.meta.ai/?q=${encodedPrompt}`
        break
      case 'Mistral':
        finalUrl = `https://chat.mistral.ai/?q=${encodedPrompt}`
        break
      case 'Grok':
        finalUrl = `https://x.com/i/grok?q=${encodedPrompt}`
        break
      default:
        finalUrl = `${aiData.url}?q=${encodedPrompt}`
    }

    // Track view and open AI
    trackPromptView(prompt.id)
    window.open(finalUrl, '_blank')
    toast.success(`Opening with ${aiData.name}...`)
  }, [])

  const trackPromptView = async (promptId: number) => {
    try {
      if (!supabase) return
      
      // Use the RPC function to increment views
      const { error } = await supabase
        .rpc('increment_prompt_views', { prompt_id: promptId })

      if (error) {
        console.error('Error tracking view:', error)
      }
    } catch (error) {
      console.error('Error tracking view:', error)
    }
  }


  const generateMockUsage = (id: number) => {
    // Generate consistent usage count based on ID
    return ((id * 47 + 123) % 5000) + 100
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Header skeleton */}
      <header className="bg-gray-800/90 backdrop-blur-md border-b border-gray-700 px-6 py-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-8 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-8 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        {/* AI badges skeleton */}
        <div className="flex gap-2 mt-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-16 h-6 bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </header>

      <div className="pt-[120px] min-h-screen">
        <div className="flex">
          {/* Sidebar skeleton */}
          <aside className="w-60 bg-gray-800 border-r border-gray-700 h-screen overflow-y-auto p-4 fixed top-[120px] bottom-0">
            <div className="mb-6">
              <div className="w-full h-10 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="space-y-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-full h-8 bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          </aside>

          {/* Main content skeleton */}
          <main className="flex-1 p-6 ml-60 pb-20">
            <div className="mb-6">
              <div className="w-64 h-4 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-3/4 h-4 bg-gray-700 rounded animate-pulse"></div>
                    <div className="flex gap-1">
                      <div className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
                      <div className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
                      <div className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="mb-4 space-y-2">
                    <div className="w-full h-3 bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-full h-3 bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-3/4 h-3 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="flex gap-1 flex-wrap mb-3">
                    <div className="w-16 h-5 bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-12 h-5 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="w-3 h-3 bg-gray-700 rounded animate-pulse"></div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-4 bg-gray-700 rounded animate-pulse"></div>
                      <div className="w-8 h-4 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <header className="bg-gray-800/90 backdrop-blur-md border-b border-gray-700 px-6 py-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-green-400">Prompt Gallery</h1>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('https://github.com/Talktodre-ops/AI_PromptTools_Full', '_blank')}
              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 border border-yellow-400/30 hover:border-yellow-400/50 transition-all duration-200"
            >
              <Star className="mr-2 h-4 w-4 fill-current" />
              Star on GitHub
            </Button>
            <span className="flex items-center gap-1">
              <span className="text-green-400">✓</span> powered by supabase
            </span>
            <span className="text-green-400">{prompts.length}</span>
            <span>browse <strong>{prompts.length}</strong> AI prompts for <strong>everyone</strong></span>
          </div>
        </div>

        {/* AI Model Selection */}
        <div className="flex gap-2 mt-3">
          {[
            { name: 'ChatGPT', url: 'https://chat.openai.com/', color: 'from-green-500 to-emerald-500' },
            { name: 'Claude', url: 'https://claude.ai/', color: 'from-orange-500 to-red-500' },
            { name: 'Gemini', url: 'https://gemini.google.com/', color: 'from-blue-500 to-purple-500' },
            { name: 'Perplexity', url: 'https://www.perplexity.ai/', color: 'from-purple-500 to-pink-500' },
            { name: 'Copilot', url: 'https://copilot.microsoft.com/', color: 'from-cyan-500 to-blue-500' },
            { name: 'Meta AI', url: 'https://www.meta.ai/', color: 'from-indigo-500 to-purple-500' },
            { name: 'Mistral', url: 'https://chat.mistral.ai/', color: 'from-yellow-500 to-orange-500' },
            { name: 'Grok', url: 'https://x.com/i/grok', color: 'from-gray-500 to-gray-700' }
          ].map(ai => (
            <Badge
              key={ai.name}
              className={cn(
                `bg-gradient-to-r ${ai.color} text-white text-xs px-3 py-1 cursor-pointer transition-all duration-200 border-0`,
                selectedAI === ai.name
                  ? "scale-105 ring-2 ring-white/30 shadow-lg"
                  : "hover:opacity-80 hover:scale-105"
              )}
              onClick={() => {
                // Store selected AI for later use
                localStorage.setItem('selectedAI', JSON.stringify(ai))
                setSelectedAI(ai.name)
                toast.success(`Selected ${ai.name} for prompts`)
              }}
            >
              {ai.name}
            </Badge>
          ))}
        </div>
      </header>

      <div className="pt-[120px] min-h-screen">
        <div className="flex">
          {/* Left Sidebar */}
          <aside className="w-60 bg-gray-800 border-r border-gray-700 h-screen overflow-y-auto p-4 fixed top-[120px] bottom-0">
          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          {/* Categories */}
          <div className="space-y-1">
            {categories.map(category => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center",
                  selectedCategory === category.name
                    ? "bg-green-500/20 text-green-400"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
              >
                <span className="truncate">{category.name}</span>
                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{category.count}</span>
              </button>
            ))}
          </div>
        </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 ml-60 pb-20">
          {/* Results count */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm">
              Showing {filteredPrompts.length} prompts from prompt-gallery table
              {selectedCategory !== 'All Prompts' && ` in "${selectedCategory}"`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          {/* Prompts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrompts.map((prompt, index) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-white font-medium text-sm leading-tight">
                    {prompt['prompt-title']}
                  </h3>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyPrompt(prompt)}
                      className={cn(
                        "h-6 w-6 p-0 transition-all duration-200",
                        copiedPrompts.has(prompt.id)
                          ? "text-green-400 hover:text-green-300 bg-green-400/20"
                          : "text-gray-400 hover:text-white hover:bg-gray-700"
                      )}
                      title={copiedPrompts.has(prompt.id) ? "Copied!" : "Copy prompt"}
                    >
                      <motion.div
                        animate={copiedPrompts.has(prompt.id) ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Copy className="h-3 w-3" />
                      </motion.div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikePrompt(prompt)}
                      className={cn(
                        "h-6 w-6 p-0 transition-all duration-200",
                        likedPrompts.has(prompt.id)
                          ? "text-red-400 hover:text-red-300 bg-red-400/20"
                          : "text-gray-400 hover:text-white hover:bg-gray-700"
                      )}
                      title={likedPrompts.has(prompt.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <motion.div
                        animate={likedPrompts.has(prompt.id) ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Heart className={cn(
                          "h-3 w-3 transition-all duration-200",
                          likedPrompts.has(prompt.id) ? "fill-current" : ""
                        )} />
                      </motion.div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenWithAI(prompt)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                      title="Open with AI"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Prompt Content */}
                <div className="mb-4">
                  <p className="text-gray-300 text-xs leading-relaxed line-clamp-4">
                    {prompt['prompt-content']}
                  </p>
                </div>

                {/* Tags (extract from content) */}
                <div className="flex gap-1 flex-wrap mb-3">
                  {prompt['prompt-title'].toLowerCase().includes('act as') && (
                    <Badge className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 border-0">
                      role-play
                    </Badge>
                  )}
                  {prompt['prompt-content'].toLowerCase().includes('code') && (
                    <Badge className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 border-0">
                      coding
                    </Badge>
                  )}
                  {prompt['prompt-content'].toLowerCase().includes('write') && (
                    <Badge className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 border-0">
                      writing
                    </Badge>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-3 w-3",
                          star <= Math.floor(prompt.rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-600"
                        )}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">
                      {prompt.rating?.toFixed(1) || '0.0'} ({prompt.rating_count || 0})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {prompt.views || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {prompt.likes || 0}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredPrompts.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No prompts found matching your criteria.</p>
              <p className="text-gray-400">Try adjusting your search or category filter.</p>
            </div>
          )}
          </main>
        </div>
      </div>

      {/* Static Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-gray-800/90 backdrop-blur-md border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Developer Attribution */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Built with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span className="text-gray-400">by</span>
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent font-bold">
                @Talktodre-ops
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10"
                onClick={() => window.open('https://linkedin.com/in/talktodre-ops', '_blank')}
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10"
                onClick={() => window.open('https://twitter.com/talktodre_ops', '_blank')}
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-pink-400 hover:bg-pink-400/10"
                onClick={() => window.open('https://instagram.com/talktodre_ops', '_blank')}
              >
                <Instagram className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-green-400 hover:bg-green-400/10"
                onClick={() => window.open('mailto:contact@talktodre-ops.dev', '_blank')}
              >
                <Mail className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10"
                onClick={() => window.open('https://github.com/Talktodre-ops/AI_PromptTools_Full', '_blank')}
              >
                <Github className="h-4 w-4" />
              </Button>
            </div>

            {/* Contact for collaboration */}
            <div className="text-xs text-gray-500">
              Open for collaboration • AI Development Partner
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}