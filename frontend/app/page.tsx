"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import type { Prompt } from "@/types"
import PromptForm from "@/components/prompt-form"
import PromptResults from "@/components/prompt-results"
import WelcomePage from "@/components/welcome-page"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

// Client component that uses useSearchParams
function PageContent() {
  const [results, setResults] = useState<Prompt[]>([])
  const [hasStarted, setHasStarted] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Check URL parameters on initial load
  useEffect(() => {
    const view = searchParams.get('view')
    if (view === 'prompt') {
      setHasStarted(true)
    }
  }, [searchParams])

  // Load state from localStorage on initial render
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      // Load hasStarted state from URL first, then localStorage as fallback
      const view = searchParams.get('view')
      if (view === 'prompt') {
        setHasStarted(true)
      } else {
        const savedHasStarted = localStorage.getItem('hasStarted')
        if (savedHasStarted === 'true') {
          setHasStarted(true)
          // Update URL to match state
          router.push('/?view=prompt')
        }
      }

      // Load results if they exist
      const savedResults = localStorage.getItem('promptResults')
      if (savedResults) {
        try {
          const parsedResults = JSON.parse(savedResults)
          setResults(parsedResults)
        } catch (e) {
          console.error('Error parsing saved results:', e)
        }
      }
    }
  }, [router, searchParams])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasStarted', hasStarted.toString())
    }
  }, [hasStarted])

  useEffect(() => {
    if (typeof window !== 'undefined' && results.length > 0) {
      localStorage.setItem('promptResults', JSON.stringify(results))
    }
  }, [results])

  // Debug results changes with useEffect instead of inline console.log
  useEffect(() => {
    console.log('Current results:', results)
  }, [results])

  const handleResults = (newResults: Prompt[]) => {
    console.log('Setting new results:', newResults)
    setResults(newResults)
  }

  const handleStart = () => {
    setHasStarted(true)
    // Update URL with query parameter instead of path
    router.push('/?view=prompt')
  }

  const handleBack = () => {
    setHasStarted(false)
    // Update URL to remove query parameter
    router.push('/')
  }

  if (!hasStarted) {
    return <WelcomePage onStart={handleStart} />
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-4 md:py-12 max-w-5xl">
        {/* Back button */}
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Welcome
          </Button>
        </div>
        
        {/* Reduced top padding for mobile and adjusted spacing */}
        <header className="mb-6 md:mb-8 text-center space-y-3 pt-4 md:pt-8">
          <h1 className="text-2xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">
            Prompt Engineer
          </h1>
          <p className="text-sm md:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Transform your messy thoughts into high-quality, ready-to-use AI prompts
          </p>
        </header>

        <div className="grid gap-6 md:gap-8 mt-6 md:mt-8">
          <PromptForm onResults={handleResults} />
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

// Main page component with Suspense boundary
export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Loading...</h1>
          <div className="w-48 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto overflow-hidden">
            <div className="bg-indigo-500 h-full animate-progress"></div>
          </div>
        </div>
      </div>
    }>
      <PageContent />
    </Suspense>
  )
}
