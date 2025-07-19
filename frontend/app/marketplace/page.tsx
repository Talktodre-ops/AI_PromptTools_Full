"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { useInView } from 'react-intersection-observer'
import { motion, AnimatePresence } from 'framer-motion'
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
import { Star, Heart, Download, Share2, Plus, Search, Filter, TrendingUp, Clock, Users, Eye, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { PromptMarketplace } from '@/lib/utils'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton"

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

// Mock data generation for infinite scroll
 const generateMockTemplates = (count: number, startId: number): MarketplaceTemplate[] => {
   const categories = CATEGORIES.slice(1)
   return Array.from({ length: count }, (_, i) => ({
     id: (startId + i).toString(),
     title: `Template ${startId + i}`,
     description: `Description for template ${startId + i}`,
     content: `Content for template ${startId + i}`,
     category: categories[Math.floor(Math.random() * categories.length)],
     mode: 'Mode',
     tags: ['tag1', 'tag2'],
     author: 'Author',
     authorAvatar: '/placeholder-user.jpg',
     rating: Math.random() * 5,
     ratingCount: Math.floor(Math.random() * 100),
     downloads: Math.floor(Math.random() * 1000),
     likes: Math.floor(Math.random() * 500),
     views: Math.floor(Math.random() * 2000),
     createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
     isLiked: false,
     isPremium: Math.random() > 0.5,
   }))
 }

export default function MarketplacePage() {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>(generateMockTemplates(12, 1))
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [sortBy, setSortBy] = useState('popular')
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [newTemplate, setNewTemplate] = useState({ title: '', description: '', content: '', category: '', mode: '', tags: '' })
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const { ref, inView } = useInView()
  const [filteredTemplates, setFilteredTemplates] = useState<MarketplaceTemplate[]>([])

  useEffect(() => {
    filterAndSortTemplates()
  }, [templates, searchQuery, selectedCategory, sortBy])

  useEffect(() => {
    if (inView && hasMore) {
      setPage(prev => prev + 1)
    }
  }, [inView, hasMore])

  useEffect(() => {
    if (page > 1) {
      // Simulate API delay
      setTimeout(() => {
        const newTemplates = generateMockTemplates(6, templates.length + 1)
        setTemplates(prev => [...prev, ...newTemplates])
        if (page >= 5) setHasMore(false) // Simulate end of data
      }, 1000)
      }
  }, [page])

  const handleLike = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isLiked: !template.isLiked, likes: template.isLiked ? template.likes - 1 : template.likes + 1 }
        : template
    ))
  }

  const handleDownload = (template: MarketplaceTemplate) => {
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, downloads: t.downloads + 1 }
        : t
    ))
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
    setNewTemplate({ title: '', description: '', content: '', category: '', mode: '', tags: '' })
    setIsShareDialogOpen(false)
    toast.success('Template shared successfully!')
  }

  const handleViewTemplate = (template: MarketplaceTemplate) => {
    setSelectedTemplate(template)
    setIsDetailDialogOpen(true)
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, views: t.views + 1 }
        : t
    ))
  }

  const filterAndSortTemplates = () => {
    let filtered = templates.filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === 'All Categories' || template.category === selectedCategory
      return matchesSearch && matchesCategory
    })

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

  const renderStars = (rating: number) => (
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

  const featuredTemplates = templates.slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-80" />
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold text-white mb-4"
          >
            Prompt Marketplace
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/80 max-w-2xl mx-auto mb-8"
          >
            Discover, share, and monetize the world's best AI prompt templates
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90">
              <Plus className="mr-2 h-5 w-5" /> Share Your Template
            </Button>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {[
            { icon: Eye, label: 'Templates', value: templates.length.toLocaleString() },
            { icon: Download, label: 'Downloads', value: templates.reduce((sum, t) => sum + t.downloads, 0).toLocaleString() },
            { icon: Users, label: 'Creators', value: new Set(templates.map(t => t.author)).size.toLocaleString() },
            { icon: TrendingUp, label: 'Avg Rating', value: (templates.reduce((sum, t) => sum + t.rating, 0) / templates.length).toFixed(1) },
          ].map((stat, i) => (
            <Card key={i} className="p-6 text-center">
              <stat.icon className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
          </Card>
          ))}
        </motion.div>

        {/* Featured Carousel */}
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6">Featured Templates</h2>
          <Carousel className="w-full">
            <CarouselContent>
              {filteredTemplates.map((template: MarketplaceTemplate, index: number) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>{template.title}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderStars(template.rating)}
                      <Button className="mt-4 w-full" onClick={() => handleViewTemplate(template)}>View</Button>
            </CardContent>
          </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </motion.section>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Input
            placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2" /> Share Template</Button>
            </DialogTrigger>
            <DialogContent>
              {/* Keep existing share form */}
            </DialogContent>
          </Dialog>
        </div>

        {/* Infinite Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>{template.title}</CardTitle>
                      {template.isPremium && <Badge>Premium</Badge>}
                  </div>
                    <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                  {renderStars(template.rating)}
                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => handleViewTemplate(template)}>View</Button>
                      <Button variant="outline" onClick={() => handleLike(template.id)}>
                        <Heart className={template.isLiked ? 'fill-red-500' : ''} />
                    </Button>
                </div>
              </CardContent>
            </Card>
              </motion.div>
          ))}
          </AnimatePresence>
        </div>
        {hasMore && (
          <div ref={ref} className="flex justify-center py-8">
            <Skeleton className="w-32 h-4" />
          </div>
        )}

        {/* Detail Dialog - Keep but add tabs for preview/reviews */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-3xl">
            {selectedTemplate && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedTemplate.title}</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="preview">
                  <TabsList>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  <TabsContent value="preview">
                    <p>{selectedTemplate.content}</p>
                  </TabsContent>
                  <TabsContent value="reviews">
                    <p>Reviews coming soon!</p>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 