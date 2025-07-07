'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, Download, Users, TrendingUp, ArrowRight, CheckCircle, Zap, Shield, Globe } from 'lucide-react'
import Head from 'next/head'

const FEATURES = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Community-Driven",
    description: "Join thousands of prompt engineers sharing and discovering the best AI prompts"
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Quality Rated",
    description: "All templates are rated and reviewed by the community to ensure high quality"
  },
  {
    icon: <Download className="w-6 h-6" />,
    title: "Instantly Usable",
    description: "Copy and use any prompt template immediately in your favorite AI tools"
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Trending Content",
    description: "Discover the most popular and effective prompts used by professionals"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Performance Optimized",
    description: "All prompts are optimized for maximum AI output quality and relevance"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Verified Quality",
    description: "Every template is tested and verified to work with major AI platforms"
  }
]

const CATEGORIES = [
  {
    name: "Writing & Content",
    count: 240,
    description: "Blog posts, articles, social media content, and copywriting prompts",
    popular: ["Blog Post Generator", "Social Media Caption", "Email Marketing"],
    color: "bg-blue-500"
  },
  {
    name: "Business & Marketing",
    count: 186,
    description: "Product descriptions, business plans, marketing strategies, and sales content",
    popular: ["Product Description", "Business Plan", "Marketing Strategy"],
    color: "bg-green-500"
  },
  {
    name: "Technical & Code",
    count: 128,
    description: "Documentation, tutorials, code reviews, and technical writing",
    popular: ["API Documentation", "Code Review", "Technical Tutorial"],
    color: "bg-purple-500"
  },
  {
    name: "Creative & Design",
    count: 95,
    description: "Creative briefs, design concepts, brand stories, and artistic content",
    popular: ["Creative Brief", "Brand Story", "Design Concept"],
    color: "bg-orange-500"
  },
  {
    name: "Video & Media",
    count: 72,
    description: "Video scripts, storyboards, social media videos, and multimedia content",
    popular: ["Video Script", "Storyboard", "Social Video"],
    color: "bg-red-500"
  }
]

const TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    role: "Content Marketing Manager",
    company: "TechCorp",
    content: "The marketplace has completely transformed our content creation process. We've improved our output quality by 300% using these templates.",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Freelance Writer",
    company: "Independent",
    content: "As a freelancer, these prompt templates have saved me countless hours. I can deliver better results to my clients much faster.",
    rating: 5
  },
  {
    name: "Emma Rodriguez",
    role: "Social Media Manager",
    company: "BrandStudio",
    content: "The video prompt templates are incredible. Our social media engagement has increased by 150% since we started using them.",
    rating: 5
  }
]

const STATS = [
  { label: "Active Templates", value: "1,200+", description: "High-quality prompt templates" },
  { label: "Community Members", value: "15,000+", description: "Active prompt engineers" },
  { label: "Total Downloads", value: "500K+", description: "Templates downloaded" },
  { label: "Average Rating", value: "4.8/5", description: "Community satisfaction" }
]

export default function MarketplaceSEOPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Marketplace",
    "name": "PROMPTHERO Marketplace",
    "description": "The world's largest marketplace for AI prompt templates. Discover, share, and download high-quality prompts for ChatGPT, Claude, Gemini, and other AI tools.",
    "url": "https://prompthero.app/marketplace",
    "provider": {
      "@type": "Organization",
      "name": "PROMPTHERO",
      "url": "https://prompthero.app"
    },
    "offers": {
      "@type": "AggregateOffer",
      "offerCount": "1200",
      "lowPrice": "0",
      "highPrice": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "15000"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Content Creators, Marketers, Developers, Writers, Business Professionals"
    }
  }

  return (
    <>
      <Head>
        <title>AI Prompt Templates Marketplace - Download Free & Premium Prompts | PROMPTHERO</title>
        <meta name="description" content="Discover the world's largest marketplace for AI prompt templates. Download free and premium prompts for ChatGPT, Claude, Gemini, and more. Join 15,000+ prompt engineers sharing high-quality templates." />
        <meta name="keywords" content="AI prompts, ChatGPT prompts, prompt templates, AI marketplace, prompt engineering, AI tools, content creation, marketing prompts, video prompts, business prompts, writing prompts, technical prompts, creative prompts" />
        <meta property="og:title" content="AI Prompt Templates Marketplace - Download Free & Premium Prompts" />
        <meta property="og:description" content="Discover the world's largest marketplace for AI prompt templates. Join 15,000+ prompt engineers sharing high-quality templates." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://prompthero.app/marketplace/seo" />
        <meta property="og:image" content="https://prompthero.app/marketplace-og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Prompt Templates Marketplace - Download Free & Premium Prompts" />
        <meta name="twitter:description" content="Discover the world's largest marketplace for AI prompt templates. Join 15,000+ prompt engineers sharing high-quality templates." />
        <meta name="twitter:image" content="https://prompthero.app/marketplace-og.png" />
        <link rel="canonical" href="https://prompthero.app/marketplace/seo" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                The World's Largest
                <span className="block text-yellow-300">AI Prompt Marketplace</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
                Discover, share, and download high-quality AI prompt templates. 
                Join 15,000+ prompt engineers creating better AI outputs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/marketplace">
                  <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                    Browse Templates
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/marketplace?action=share">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    Share Your Prompts
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-600">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose PROMPTHERO Marketplace?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The most comprehensive platform for AI prompt templates, trusted by professionals worldwide
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURES.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Browse by Category
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Find the perfect prompt templates for your specific needs
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {CATEGORIES.map((category, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </div>
                      <Badge variant="secondary">{category.count} templates</Badge>
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Popular templates:</p>
                      <div className="flex flex-wrap gap-1">
                        {category.popular.map((template, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {template}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Link href={`/marketplace?category=${encodeURIComponent(category.name)}`}>
                      <Button className="w-full mt-4" variant="outline">
                        Explore Category
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Trusted by Professionals
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See what our community members say about PROMPTHERO Marketplace
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-sm text-gray-500">{testimonial.company}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 italic">"{testimonial.content}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get started with our marketplace in just three simple steps
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Browse & Search</h3>
                <p className="text-gray-600">Explore thousands of high-quality prompt templates across different categories</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Download & Customize</h3>
                <p className="text-gray-600">Download templates instantly and customize them for your specific needs</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Create & Share</h3>
                <p className="text-gray-600">Use with your favorite AI tools and share your own templates with the community</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your AI Experience?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
              Join thousands of professionals who are already using PROMPTHERO to create better AI outputs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                  Start Browsing Templates
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about PROMPTHERO Marketplace
              </p>
            </div>
            <div className="space-y-8">
              {[
                {
                  question: "What types of AI prompts are available?",
                  answer: "We offer prompts for all major AI platforms including ChatGPT, Claude, Gemini, and more. Categories include writing, business, technical, creative, and video prompts."
                },
                {
                  question: "Are the prompt templates free?",
                  answer: "Yes! Most templates are completely free to download and use. Premium templates are available for advanced users who want exclusive, professionally-crafted prompts."
                },
                {
                  question: "Can I share my own prompts?",
                  answer: "Absolutely! We encourage community contributions. You can easily share your own prompt templates and help other users while building your reputation in the community."
                },
                {
                  question: "How do I know which prompts are high quality?",
                  answer: "All prompts are rated and reviewed by our community. We also feature trending and popular templates based on downloads and user ratings."
                },
                {
                  question: "Do I need an account to download prompts?",
                  answer: "No account is required for basic downloads. However, creating a free account allows you to save favorites, track your downloads, and access premium features."
                }
              ].map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
} 