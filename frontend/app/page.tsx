"use client"

import { useState } from "react"
import { Suspense } from "react"
import type { Prompt } from "@/types"
import PromptForm from "@/components/prompt-form"
import PromptResults from "@/components/prompt-results"
import WelcomePage from "@/components/welcome-page"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  const [results, setResults] = useState<Prompt[]>([])
  const [hasStarted, setHasStarted] = useState(false)

  if (!hasStarted) {
    return <WelcomePage onStart={() => setHasStarted(true)} />
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-4 md:py-12 max-w-5xl">
        {/* Increased top padding for mobile */}
        <header className="mb-6 md:mb-8 text-center space-y-4 pt-16 md:pt-8">
          {/* Adjusted text sizes and added mobile padding */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 px-4">
            Prompt Engineer
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-4 leading-relaxed">
            Transform your messy thoughts into high-quality, ready-to-use AI prompts
          </p>
        </header>

        {/* Increased spacing between elements */}
        <div className="grid gap-8 md:gap-8 mt-8">
          <PromptForm onResults={setResults} />
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
