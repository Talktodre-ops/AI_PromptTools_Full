"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Film, Image as ImageIcon, Sparkles, Copy, Download, Share2, Heart, Star, TrendingUp } from "lucide-react"
import PromptForm from "@/components/prompt-form"
import VideoPromptForm from "@/components/video-prompt-form"
import ImagePromptForm from "@/components/image-prompt-form"
import PromptResults from "@/components/prompt-results"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface UnifiedPromptInterfaceProps {
  onResults: (results: any[]) => void
  results: any[]
  onTabChange?: (tab: string) => void
}

interface PromptCard {
  id: string
  title: string
  description: string
  prompt: string
  category: string
  tags: string[]
  rating: number
  rating_count: number
  uses: number
  type: 'text' | 'video' | 'image'
  created_at: string
  user_rating?: number // Current user's rating
}

// Dynamic prompt cards from database/API
const examplePrompts: PromptCard[] = [
  {
    id: '1',
    title: 'Linux Developer',
    description: 'Act as a Linux terminal expert',
    prompt: 'I want you to act as a linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. do not write explanations. do not type commands unless I instruct you to do so.',
    category: 'Linux Developer',
    tags: ['linux', 'terminal', 'command-line'],
    rating: 4.2,
    rating_count: 156,
    uses: 2341,
    type: 'text',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Data Scientist',
    description: 'Professional data analysis and insights',
    prompt: 'I want you to act as a data scientist. Imagine you\'re working on a challenging project for a cutting-edge tech company. You\'ve been tasked with extracting valuable insights from a large dataset. Please analyze the data I provide and give me actionable insights.',
    category: 'Data Scientist',
    tags: ['data-analysis', 'python', 'statistics'],
    rating: 4.7,
    rating_count: 89,
    uses: 1876,
    type: 'text',
    created_at: '2024-01-14T15:20:00Z'
  },
  {
    id: '3',
    title: 'UX/UI Designer',
    description: 'Design thinking and user experience expertise',
    prompt: 'I want you to act as a UX/UI developer. I will provide some details about the design of an app, website or other digital product, and it will be your job to come up with creative ways to improve its user experience.',
    category: 'UX/UI Designer',
    tags: ['design', 'user-experience', 'interface'],
    rating: 4.5,
    rating_count: 203,
    uses: 1543,
    type: 'text',
    created_at: '2024-01-13T09:45:00Z'
  },
  {
    id: '4',
    title: 'Software Engineer',
    description: 'Code reviews and technical architecture',
    prompt: 'I want you to act as a software engineer. I\'ll provide you with code and you should analyze it for best practices, potential bugs, performance optimizations, and suggest improvements. Focus on clean code principles, SOLID principles, and maintainability.',
    category: 'Software Engineer',
    tags: ['coding', 'review', 'architecture'],
    rating: 4.8,
    rating_count: 312,
    uses: 3721,
    type: 'text',
    created_at: '2024-01-12T14:10:00Z'
  },
  {
    id: '5',
    title: 'Digital Marketer',
    description: 'Marketing strategy and campaign creation',
    prompt: 'I want you to act as a digital marketing expert. Create a comprehensive marketing strategy for [PRODUCT/SERVICE]. Include target audience analysis, key messaging, content strategy, and recommended channels for maximum reach and conversion.',
    category: 'Digital Marketer',
    tags: ['marketing', 'strategy', 'campaigns'],
    rating: 4.3,
    rating_count: 145,
    uses: 2890,
    type: 'text',
    created_at: '2024-01-11T11:25:00Z'
  },
  {
    id: '6',
    title: 'Film Director',
    description: 'Cinematic video scene direction',
    prompt: 'I want you to act as a film director. Describe a cinematic scene for [SCENE DESCRIPTION]. Include camera movements, lighting setup, mood, color palette, and specific technical details for achieving professional cinematography.',
    category: 'Film Director',
    tags: ['cinematography', 'directing', 'visual'],
    rating: 4.6,
    rating_count: 78,
    uses: 1234,
    type: 'video',
    created_at: '2024-01-10T16:40:00Z'
  }
]

export default function UnifiedPromptInterface({ onResults, results, onTabChange }: UnifiedPromptInterfaceProps) {
  const [activeTab, setActiveTab] = useState("text")
  const [selectedPrompt, setSelectedPrompt] = useState<PromptCard | null>(null)
  const [favoritePrompts, setFavoritePrompts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Call onTabChange when activeTab changes
  useEffect(() => {
    onTabChange?.(activeTab)
  }, [activeTab, onTabChange])

  // Get unique categories for filter
  const categories = [...new Set(examplePrompts.map(p => p.category))]

  // Filter prompts by type, search, and category
  const filteredPrompts = examplePrompts.filter(prompt => {
    const typeMatch = activeTab === "text" ? prompt.type === "text" :
                     activeTab === "video" ? prompt.type === "video" :
                     prompt.type === "image"

    const searchMatch = searchQuery === "" ||
                       prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       prompt.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                       prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase())

    const categoryMatch = selectedCategory === "all" || prompt.category === selectedCategory

    return typeMatch && searchMatch && categoryMatch
  })

  const handleCopyPrompt = async (prompt: PromptCard) => {
    try {
      await navigator.clipboard.writeText(prompt.prompt)
      toast.success("Prompt copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy prompt")
    }
  }

  const handleFavorite = (promptId: string) => {
    setFavoritePrompts(prev =>
      prev.includes(promptId)
        ? prev.filter(id => id !== promptId)
        : [...prev, promptId]
    )
  }

  const handleRating = async (promptId: string, rating: number) => {
    try {
      // TODO: Replace with actual API call to Supabase
      // await ratePrompt(promptId, rating)
      toast.success(`Rated ${rating} stars!`)

      // Update local state (in real app, refetch from API)
      console.log(`Rating prompt ${promptId} with ${rating} stars`)
    } catch (error) {
      toast.error("Failed to rate prompt")
    }
  }

  const renderInteractiveStars = (prompt: PromptCard) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(prompt.id, star)}
            className="group"
          >
            <Star
              className={cn(
                "h-4 w-4 transition-all duration-200",
                star <= Math.floor(prompt.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-600 hover:text-yellow-300"
              )}
            />
          </button>
        ))}
        <span className="text-sm text-gray-400 ml-1">
          {prompt.rating.toFixed(1)} ({prompt.rating_count})
        </span>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <TabsList className="glass backdrop-blur-2xl border border-white/10 bg-black/20 p-2 rounded-2xl">
            <TabsTrigger
              value="text"
              className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/30 data-[state=active]:to-pink-500/30 data-[state=active]:text-white text-gray-400 hover:text-white transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              Text Prompts
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500/30 data-[state=active]:to-orange-500/30 data-[state=active]:text-white text-gray-400 hover:text-white transition-all"
            >
              <Film className="h-4 w-4" />
              Video Prompts
            </TabsTrigger>
            <TabsTrigger
              value="image"
              className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/30 data-[state=active]:to-cyan-500/30 data-[state=active]:text-white text-gray-400 hover:text-white transition-all"
            >
              <ImageIcon className="h-4 w-4" />
              Image Prompts
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content Areas */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left Column - Prompt Forms */}
          <div className="lg:col-span-1">
            <div className="glass-dark rounded-2xl p-6 backdrop-blur-2xl border border-white/10 sticky top-6">
              <TabsContent value="text" className="mt-0">
                <h3 className="text-xl font-bold text-white mb-4">Create Text Prompt</h3>
                <PromptForm onResults={onResults} />
              </TabsContent>
              <TabsContent value="video" className="mt-0">
                <h3 className="text-xl font-bold text-white mb-4">Create Video Prompt</h3>
                <VideoPromptForm onResults={onResults} />
              </TabsContent>
              <TabsContent value="image" className="mt-0">
                <h3 className="text-xl font-bold text-white mb-4">Create Image Prompt</h3>
                <ImagePromptForm onResults={onResults} />
              </TabsContent>
            </div>
          </div>

          {/* Middle Column - Example Prompts Gallery */}
          <div className="lg:col-span-1">
            <div className="glass-dark rounded-2xl p-6 backdrop-blur-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Example Prompts</h3>
                <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30">
                  {filteredPrompts.length} prompts
                </Badge>
              </div>

              {/* Search and Filter */}
              <div className="space-y-3 mb-6">
                <input
                  type="text"
                  placeholder="Search by role, category, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {filteredPrompts.map((prompt, index) => (
                    <motion.div
                      key={prompt.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="glass backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer group">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg text-white group-hover:text-purple-300 transition-colors">
                              {prompt.title}
                            </CardTitle>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleFavorite(prompt.id)}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <Heart className={cn(
                                "h-4 w-4",
                                favoritePrompts.includes(prompt.id) && "fill-red-400 text-red-400"
                              )} />
                            </Button>
                          </div>
                          <Badge variant="outline" className="text-xs text-purple-300 border-purple-500/30 mb-2 w-fit">
                            {prompt.category}
                          </Badge>

                          {/* Prompt Content Preview */}
                          <div className="bg-black/20 rounded-lg p-3 mb-3 border border-white/5">
                            <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed font-mono">
                              {prompt.prompt}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {prompt.tags.slice(0, 3).map((tag, i) => (
                              <Badge key={i} className="text-xs bg-white/5 text-gray-400 border-white/10">
                                {tag}
                              </Badge>
                            ))}
                            {prompt.tags.length > 3 && (
                              <Badge className="text-xs bg-white/5 text-gray-400 border-white/10">
                                +{prompt.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between mb-3">
                            {renderInteractiveStars(prompt)}
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <TrendingUp className="h-3 w-3" />
                              {prompt.uses}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleCopyPrompt(prompt)}
                              className="flex-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-white border border-purple-500/30"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedPrompt(prompt)}
                              className="border-white/20 text-gray-300 hover:text-white hover:border-white/40"
                            >
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-1 order-3">
            <div className="glass-dark rounded-2xl p-4 sm:p-6 backdrop-blur-2xl border border-white/10">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Generated Results</h3>
              {results.length > 0 ? (
                <PromptResults results={results} />
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Sparkles className="h-8 sm:h-12 w-8 sm:w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-gray-400">Your generated prompts will appear here</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    Use the form to create your custom prompts
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </Tabs>

      {/* Prompt Detail Modal */}
      {selectedPrompt && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedPrompt(null)}
        >
          <motion.div
            className="glass-dark rounded-2xl border border-white/10 p-4 sm:p-6 max-w-3xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <div className="flex-1 pr-2">
                <h2 className="text-lg sm:text-2xl font-bold text-white mb-2">{selectedPrompt.title}</h2>
                <Badge variant="outline" className="text-xs sm:text-sm text-purple-300 border-purple-500/30">
                  {selectedPrompt.category}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedPrompt(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            {/* Full Prompt Display */}
            <div className="bg-black/30 rounded-xl p-6 mb-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Prompt:</h3>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-mono">
                {selectedPrompt.prompt}
              </pre>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Rating</h4>
                <div className="flex items-center gap-2">
                  {renderInteractiveStars(selectedPrompt)}
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Usage</h4>
                <div className="flex items-center gap-1 text-white">
                  <TrendingUp className="h-4 w-4" />
                  <span>{selectedPrompt.uses} times used</span>
                </div>
              </div>
            </div>

            {/* Tags and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {selectedPrompt.tags.map((tag, i) => (
                  <Badge key={i} className="text-xs bg-white/5 text-gray-400 border-white/10">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleFavorite(selectedPrompt.id)}
                  className="border-white/20 text-gray-300 hover:text-red-400 hover:border-red-400/50"
                >
                  <Heart className={cn(
                    "h-4 w-4 mr-2",
                    favoritePrompts.includes(selectedPrompt.id) && "fill-red-400 text-red-400"
                  )} />
                  {favoritePrompts.includes(selectedPrompt.id) ? 'Favorited' : 'Favorite'}
                </Button>
                <Button
                  onClick={() => handleCopyPrompt(selectedPrompt)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Prompt
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}