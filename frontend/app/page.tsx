"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import PromptForm from "@/components/prompt-form"
import PromptResults from "@/components/prompt-results"
import WelcomePage from "@/components/welcome-page"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Film, Image } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { usePromptStore } from "@/lib/stores/promptStore"

export default function Page() {
  const { results, setResults } = usePromptStore()
  const [hasStarted, setHasStarted] = useState(false)
  const [usage, setUsage] = useState({ daily: 0, total: 0 })
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Load states
    const view = searchParams.get('view')
    setHasStarted(view === 'prompt' || localStorage.getItem('hasStarted') === 'true')
    // Mock usage
    setUsage({ daily: 3, total: 45 })
  }, [searchParams])

  useEffect(() => {
    if (hasStarted) router.push('/?view=prompt')
    localStorage.setItem('hasStarted', hasStarted.toString())
  }, [hasStarted, router])

  const handleStart = () => setHasStarted(true)
  const handleBack = () => setHasStarted(false)

  if (!hasStarted) return <WelcomePage onStart={handleStart} />

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
      {/* Hero */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-12 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Text Prompt Generator</h1>
        <p className="text-xl">Craft perfect AI prompts with our advanced builder</p>
      </motion.section>

      <div className="w-full p-4 md:p-8">
        <div className="flex justify-between mb-6">
          <Button variant="ghost" onClick={handleBack}><ArrowLeft /> Back</Button>
          <div className="space-x-2">
            <Link href="/history"><Button>History</Button></Link>
            <Link href="/marketplace"><Button>Marketplace</Button></Link>
            <Link href="/analytics"><Button>Analytics</Button></Link>
            <Link href="/pricing"><Button>Pricing</Button></Link>
            <Link href="/video-prompt"><Button><Film /> Video</Button></Link>
            <Link href="/video-prompt?tab=image"><Button><Image/> Image</Button></Link>
          </div>
        </div>

        {/* Usage Dashboard */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Daily Usage</p>
                <Progress value={(usage.daily / 10) * 100} className="mt-2" />
                <p className="mt-1">{usage.daily}/10</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Usage</p>
                <Progress value={(usage.total / 100) * 100} className="mt-2" />
                <p className="mt-1">{usage.total}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4 md:gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <PromptForm onResults={setResults} />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {results.length > 0 && <PromptResults results={results} />}
          </motion.div>
        </div>
      </div>
      <Toaster />
    </main>
  )
}
