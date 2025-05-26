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
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <header className="mb-8 text-center space-y-3 pt-4 md:pt-8">
          <h1 className="text-2xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">
            Prompt Engineer
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-2">
            Transform your messy thoughts into high-quality, ready-to-use AI prompts
          </p>
        </header>

        <div className="grid gap-6 md:gap-8">
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
