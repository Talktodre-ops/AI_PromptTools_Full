'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Star, Heart, Download, Share2, Plus, Search, Filter, TrendingUp, Clock, Users, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { PromptMarketplace } from '@/lib/utils'

interface MarketplaceTemplate {
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

const CATEGORIES = [
  'All Categories',
  'Writing & Content',
  'Business & Marketing',
  'Technical & Code',
  'Creative & Design',
  'Video & Media',
  'Educational',
  'Personal'
]

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'downloads', label: 'Most Downloaded' }
]

export default function MarketplacePage() {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<MarketplaceTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [sortBy, setSortBy] = useState('popular')
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    mode: '',
    tags: ''
  })
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    filterAndSortTemplates()
  }, [templates, searchQuery, selectedCategory, sortBy])

  const loadTemplates = () => {
    // Mock data - in real app, this would come from the backend
    const mockTemplates: MarketplaceTemplate[] = [
      {
        id: '1',
        title: 'Product Launch Blog Post',
        description: 'Perfect template for announcing new product launches with compelling storytelling',
        content: 'Write a compelling blog post announcing the launch of [PRODUCT NAME]. Include: 1) Hook that captures attention, 2) Problem the product solves, 3) Key features and benefits, 4) Customer testimonials or use cases, 5) Call to action for early adopters. Tone: [TONE], Target audience: [AUDIENCE]',
        category: 'Business & Marketing',
        mode: 'Blog Post',
        tags: ['product launch', 'marketing', 'blog', 'announcement'],
        author: 'Sarah Mitchell',
        authorAvatar: '/placeholder-user.jpg',
        rating: 4.8,
        ratingCount: 124,
        downloads: 892,
        likes: 156,
        views: 2341,
        createdAt: '2024-01-15',
        isLiked: false,
        isPremium: false
      },
      {
        id: '2',
        title: 'Cinematic Video Script',
        description: 'Professional video script template for creating engaging cinematic content',
        content: 'Create a cinematic video script for [VIDEO TYPE]. Include: Opening scene that establishes mood, Character development or subject introduction, Conflict or challenge presentation, Resolution or transformation, Closing with emotional impact. Style: [CINEMATIC STYLE], Duration: [DURATION], Audience: [TARGET AUDIENCE]',
        category: 'Video & Media',
        mode: 'Video Script',
        tags: ['video', 'script', 'cinematic', 'storytelling'],
        author: 'Alex Rodriguez',
        authorAvatar: '/placeholder-user.jpg',
        rating: 4.9,
        ratingCount: 87,
        downloads: 543,
        likes: 98,
        views: 1876,
        createdAt: '2024-01-10',
        isLiked: true,
        isPremium: true
      },
      {
        id: '3',
        title: 'API Documentation Template',
        description: 'Comprehensive template for creating clear and user-friendly API documentation',
        content: 'Generate comprehensive API documentation for [API NAME]. Include: 1) Overview and purpose, 2) Authentication methods, 3) Endpoint descriptions with parameters, 4) Request/response examples, 5) Error handling, 6) Code samples in multiple languages, 7) Rate limiting information. Format: [FORMAT], Audience: [DEVELOPER LEVEL]',
        category: 'Technical & Code',
        mode: 'Documentation',
        tags: ['api', 'documentation', 'technical', 'developer'],
        author: 'Dr. Emily Chen',
        authorAvatar: '/placeholder-user.jpg',
        rating: 4.7,
        ratingCount: 203,
        downloads: 1247,
        likes: 267,
        views: 3102,
        createdAt: '2024-01-08',
        isLiked: false,
        isPremium: false
      },
      {
        id: '4',
        title: 'Creative Brand Story',
        description: 'Storytelling template for crafting compelling brand narratives',
        content: 'Craft a compelling brand story for [BRAND NAME]. Structure: 1) The origin story and founding vision, 2) Challenges overcome and lessons learned, 3) Core values and mission, 4) Impact on customers and community, 5) Future aspirations and goals. Voice: [BRAND VOICE], Emotional tone: [EMOTION], Length: [LENGTH]',
        category: 'Creative & Design',
        mode: 'Brand Story',
        tags: ['branding', 'storytelling', 'narrative', 'marketing'],
        author: 'Michael Thompson',
        authorAvatar: '/placeholder-user.jpg',
        rating: 4.6,
        ratingCount: 156,
        downloads: 721,
        likes: 134,
        views: 2187,
        createdAt: '2024-01-05',
        isLiked: false,
        isPremium: false
      },
      {
        id: '5',
        title: 'Educational Course Outline',
        description: 'Structured template for creating comprehensive educational course content',
        content: 'Create a comprehensive course outline for [COURSE TOPIC]. Include: 1) Course objectives and learning outcomes, 2) Module breakdown with key concepts, 3) Assessment methods and criteria, 4) Required resources and materials, 5) Timeline and pacing guide, 6) Practical exercises and projects. Level: [SKILL LEVEL], Duration: [COURSE LENGTH], Format: [DELIVERY FORMAT]',
        category: 'Educational',
        mode: 'Course Planning',
        tags: ['education', 'course', 'curriculum', 'learning'],
        author: 'Prof. Lisa Wang',
        authorAvatar: '/placeholder-user.jpg',
        rating: 4.8,
        ratingCount: 91,
        downloads: 445,
        likes: 89,
        views: 1523,
        createdAt: '2024-01-12',
        isLiked: true,
        isPremium: true
      }
    ]
    setTemplates(mockTemplates)
  }

  const filterAndSortTemplates = () => {
    let filtered = templates.filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === 'All Categories' || template.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Sort templates
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

    setFilteredTemplates(filtered)
  }

  const handleLike = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isLiked: !template.isLiked, likes: template.isLiked ? template.likes - 1 : template.likes + 1 }
        : template
    ))
  }

  const handleDownload = (template: MarketplaceTemplate) => {
    // In a real app, this would track the download
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, downloads: t.downloads + 1 }
        : t
    ))
    
    // Copy to clipboard or use the template
    navigator.clipboard.writeText(template.content)
    toast.success('Template copied to clipboard!')
  }

  const handleShare = (template: MarketplaceTemplate) => {
    const shareUrl = `${window.location.origin}/marketplace?template=${template.id}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('Share link copied to clipboard!')
  }

  const handleShareTemplate = async () => {
    if (!newTemplate.title || !newTemplate.content) {
      toast.error('Please fill in title and content')
      return
    }

    // In a real app, this would submit to the backend
    const shared: MarketplaceTemplate = {
      id: Date.now().toString(),
      title: newTemplate.title,
      description: newTemplate.description,
      content: newTemplate.content,
      category: newTemplate.category,
      mode: newTemplate.mode,
      tags: newTemplate.tags.split(',').map(tag => tag.trim()),
      author: 'You',
      authorAvatar: '/placeholder-user.jpg',
      rating: 0,
      ratingCount: 0,
      downloads: 0,
      likes: 0,
      views: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isLiked: false,
      isPremium: false
    }

    setTemplates(prev => [shared, ...prev])
    setNewTemplate({
      title: '',
      description: '',
      content: '',
      category: '',
      mode: '',
      tags: ''
    })
    setIsShareDialogOpen(false)
    toast.success('Template shared successfully!')
  }

  const handleViewTemplate = (template: MarketplaceTemplate) => {
    setSelectedTemplate(template)
    setIsDetailDialogOpen(true)
    
    // Track view
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, views: t.views + 1 }
        : t
    ))
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Prompt Marketplace</h1>
          <p className="text-xl text-gray-600">Discover, share, and collaborate on the best prompt templates</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Templates</p>
                  <p className="text-2xl font-bold">{templates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Downloads</p>
                  <p className="text-2xl font-bold">{templates.reduce((sum, t) => sum + t.downloads, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Contributors</p>
                  <p className="text-2xl font-bold">{new Set(templates.map(t => t.author)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold">{(templates.reduce((sum, t) => sum + t.rating, 0) / templates.length).toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search templates, tags, or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Share Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Share Your Template</DialogTitle>
                <DialogDescription>
                  Share your best prompt templates with the community
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter template title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what your template does"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.slice(1).map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="mode">Mode</Label>
                    <Input
                      id="mode"
                      value={newTemplate.mode}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, mode: e.target.value }))}
                      placeholder="e.g., Blog Post, Email"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newTemplate.tags}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="e.g., marketing, social media, creative"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Template Content</Label>
                  <Textarea
                    id="content"
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter your prompt template here. Use [PLACEHOLDERS] for variables."
                    rows={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleShareTemplate} className="flex-1">
                    Share Template
                  </Button>
                  <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <CardDescription className="mt-1">{template.description}</CardDescription>
                  </div>
                  {template.isPremium && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Premium
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={template.authorAvatar} alt={template.author} />
                      <AvatarFallback>{template.author[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">{template.author}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">{template.category}</Badge>
                    <Badge variant="outline" className="text-xs">{template.mode}</Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  {renderStars(template.rating)}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {template.downloads}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className={`w-4 h-4 ${template.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        {template.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {template.views}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(template.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleViewTemplate(template)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLike(template.id)}
                    >
                      <Heart className={`w-4 h-4 ${template.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShare(template)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Template Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedTemplate && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedTemplate.title}
                    {selectedTemplate.isPremium && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Premium
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedTemplate.description}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedTemplate.authorAvatar} alt={selectedTemplate.author} />
                      <AvatarFallback>{selectedTemplate.author[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedTemplate.author}</p>
                      <p className="text-sm text-gray-600">
                        Published {new Date(selectedTemplate.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedTemplate.downloads}</p>
                      <p className="text-sm text-gray-600">Downloads</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{selectedTemplate.likes}</p>
                      <p className="text-sm text-gray-600">Likes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedTemplate.views}</p>
                      <p className="text-sm text-gray-600">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{selectedTemplate.rating}</p>
                      <p className="text-sm text-gray-600">Rating</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{selectedTemplate.category}</Badge>
                    <Badge variant="outline">{selectedTemplate.mode}</Badge>
                    {selectedTemplate.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-2">Template Content:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">{selectedTemplate.content}</pre>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => handleDownload(selectedTemplate)} className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleLike(selectedTemplate.id)}
                    >
                      <Heart className={`w-4 h-4 ${selectedTemplate.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleShare(selectedTemplate)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 