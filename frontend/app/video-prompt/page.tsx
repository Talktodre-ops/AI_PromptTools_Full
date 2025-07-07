"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Prompt } from "@/types"
import VideoPromptForm from "@/components/video-prompt-form"
import PromptResults from "@/components/prompt-results"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Film } from "lucide-react"

export default function VideoPromptPage() {
  const [results, setResults] = useState<Prompt[]>([])
  const router = useRouter()

  // Load results if they exist
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedResults = localStorage.getItem('videoPromptResults')
      if (savedResults) {
        try {
          const parsedResults = JSON.parse(savedResults)
          setResults(parsedResults)
        } catch (e) {
          console.error('Error parsing saved results:', e)
        }
      }
    }
  }, [])

  // Save results to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && results.length > 0) {
      localStorage.setItem('videoPromptResults', JSON.stringify(results))
    }
  }, [results])

  const handleResults = (newResults: Prompt[]) => {
    console.log('Setting new video prompt results:', newResults)
    setResults(newResults)
  }

  const handleBack = () => {
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-4 md:py-12 max-w-5xl">
        {/* Navigation links */}
        <div className="mb-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-2">
            <Link href="/history">
              <Button variant="outline" className="flex items-center">
                History
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline" className="flex items-center">
                Marketplace
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" className="flex items-center">
                Analytics
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="flex items-center">
                Pricing
              </Button>
            </Link>
            <Link href="/prompt">
              <Button variant="outline" className="flex items-center">
                Switch to Text Prompts
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Header */}
        <header className="mb-6 md:mb-8 text-center space-y-3 pt-4 md:pt-8">
          <div className="flex items-center justify-center gap-2">
            <Film className="h-6 w-6 md:h-8 md:w-8 text-rose-500" />
            <h1 className="text-2xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">
              Video Prompt Generator
            </h1>
          </div>
          <p className="text-sm md:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Create cinematic video prompts optimized for AI video generation tools like Runway, Pika, and Sora
          </p>
        </header>

        <div className="grid gap-6 md:gap-8 mt-6 md:mt-8">
          <VideoPromptForm onResults={handleResults} />
          <div className="min-h-[100px]">
            {results.length > 0 ? (
              <Suspense fallback={<div className="h-32 flex items-center justify-center">Loading results...</div>}>
                <PromptResults results={results} />
              </Suspense>
            ) : null}
          </div>
        </div>
      </div>
      <Toaster />
    </main>
  )
} 