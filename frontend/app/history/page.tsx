"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Search, 
  Heart, 
  Star, 
  Copy, 
  Trash2, 
  Download, 
  Upload, 
  Filter,
  Calendar,
  Tag,
  Repeat,
  BarChart3,
  Clock,
  TrendingUp,
  BookOpen,
  Archive
} from "lucide-react"
import { PromptHistory, PromptHistoryItem, PromptHistoryStats } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

const ITEMS_PER_PAGE = 12

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedMode, setSelectedMode] = useState("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "rating" | "favorites">("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [history, setHistory] = useState<PromptHistoryItem[]>([])
  const [filteredHistory, setFilteredHistory] = useState<PromptHistoryItem[]>([])
  const [stats, setStats] = useState<PromptHistoryStats>({
    totalPrompts: 0,
    favoriteCount: 0,
    avgSuccessRating: 0,
    topCategories: [],
    topModes: [],
    lastUsed: 0
  })
  const [selectedPrompt, setSelectedPrompt] = useState<PromptHistoryItem | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  // Load history on component mount
  useEffect(() => {
    loadHistory()
  }, [])

  // Filter and sort history when search/filter changes
  useEffect(() => {
    let filtered = [...history]

    // Search filter
    if (searchQuery) {
      filtered = PromptHistory.searchHistory(searchQuery)
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Mode filter
    if (selectedMode !== "all") {
      filtered = filtered.filter(item => item.mode === selectedMode)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.timestamp - a.timestamp
        case "oldest":
          return a.timestamp - b.timestamp
        case "rating":
          return (b.successRating || 0) - (a.successRating || 0)
        case "favorites":
          return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)
        default:
          return b.timestamp - a.timestamp
      }
    })

    setFilteredHistory(filtered)
    setCurrentPage(1)
  }, [history, searchQuery, selectedCategory, selectedMode, sortBy])

  const loadHistory = () => {
    const historyData = PromptHistory.getHistory()
    const statsData = PromptHistory.getStats()
    setHistory(historyData)
    setStats(statsData)
  }

  const handleToggleFavorite = (id: string) => {
    const newFavoriteStatus = PromptHistory.toggleFavorite(id)
    loadHistory()
    toast({
      title: newFavoriteStatus ? "Added to favorites" : "Removed from favorites",
      description: newFavoriteStatus ? "Prompt saved to your favorites" : "Prompt removed from favorites"
    })
  }

  const handleDeletePrompt = (id: string) => {
    if (PromptHistory.deletePrompt(id)) {
      loadHistory()
      toast({
        title: "Prompt deleted",
        description: "The prompt has been removed from your history"
      })
    }
  }

  const handleRatePrompt = (id: string, rating: number) => {
    if (PromptHistory.ratePrompt(id, rating)) {
      loadHistory()
      toast({
        title: "Rating saved",
        description: `You rated this prompt ${rating} stars`
      })
    }
  }

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The prompt has been copied to your clipboard"
    })
  }

  const handleExportHistory = () => {
    setIsExporting(true)
    try {
      const jsonData = PromptHistory.exportHistory()
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `prompthero-history-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "History exported",
        description: "Your prompt history has been exported successfully"
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your history",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportHistory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string
        if (PromptHistory.importHistory(jsonData)) {
          loadHistory()
          toast({
            title: "History imported",
            description: "Your prompt history has been imported successfully"
          })
        } else {
          toast({
            title: "Import failed",
            description: "The file format is invalid",
            variant: "destructive"
          })
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "There was an error importing your history",
          variant: "destructive"
        })
      }
    }
    reader.readAsText(file)
  }

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all history? This action cannot be undone.")) {
      PromptHistory.clearHistory()
      loadHistory()
      toast({
        title: "History cleared",
        description: "All prompt history has been cleared"
      })
    }
  }

  const getUniqueCategories = () => {
    const categories = new Set(history.map(item => item.category).filter(Boolean))
    return Array.from(categories) as string[]
  }

  const getUniqueModes = () => {
    const modes = new Set(history.map(item => item.mode))
    return Array.from(modes)
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getPaginatedItems = () => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return filteredHistory.slice(start, end)
  }

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Prompt History</h1>
        <p className="text-gray-600">View and manage your prompt generation history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrompts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favoriteCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgSuccessRating.toFixed(1)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Used</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {stats.lastUsed ? formatTimestamp(stats.lastUsed) : "Never"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {getUniqueCategories().map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMode} onValueChange={setSelectedMode}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              {getUniqueModes().map(mode => (
                <SelectItem key={mode} value={mode}>
                  {mode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleExportHistory} disabled={isExporting} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <input
            id="import-file"
            type="file"
            accept=".json"
            onChange={handleImportHistory}
            style={{ display: 'none' }}
          />
          
          <Button onClick={handleClearHistory} variant="outline">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* History Grid */}
      {filteredHistory.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No prompts found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? "No prompts match your search criteria" : "You haven't created any prompts yet"}
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery("")} variant="outline">
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 mb-8">
            {getPaginatedItems().map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{item.mode}</Badge>
                        {item.category && (
                          <Badge variant="secondary">{item.category}</Badge>
                        )}
                        {item.isFavorite && (
                          <Heart className="h-4 w-4 text-red-500 fill-current" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {formatTimestamp(item.timestamp)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleFavorite(item.id)}
                      >
                        <Heart className={`h-4 w-4 ${item.isFavorite ? 'text-red-500 fill-current' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyPrompt(item.enhancedPrompt)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePrompt(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Original Prompt</Label>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md mt-1">
                        {item.originalPrompt}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Enhanced Prompt</Label>
                      <div className="text-sm bg-blue-50 p-3 rounded-md mt-1">
                        {item.enhancedPrompt}
                      </div>
                    </div>
                    
                    {item.tags.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Tags</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rate this prompt:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRatePrompt(item.id, star)}
                            className={`text-lg hover:text-yellow-500 transition-colors ${
                              item.successRating && star <= item.successRating
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => handleCopyPrompt(item.enhancedPrompt)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Repeat className="h-4 w-4 mr-2" />
                        Use Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
} 