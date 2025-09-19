"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import PromptForm from "@/components/prompt-form"
import PromptResults from "@/components/prompt-results"
import WelcomePage from "@/components/welcome-page-premium"
import UnifiedPromptInterface from "@/components/unified-prompt-interface"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Film, Image, Github, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export default function Page() {
  const [results, setResults] = useState<any[]>([])
  const [hasStarted, setHasStarted] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Load states
    const view = searchParams.get('view')
    setHasStarted(view === 'prompt' || localStorage.getItem('hasStarted') === 'true')
  }, [searchParams])

  useEffect(() => {
    if (hasStarted) router.push('/?view=prompt')
    localStorage.setItem('hasStarted', hasStarted.toString())
  }, [hasStarted, router])

  const handleStart = () => setHasStarted(true)
  const handleBack = () => setHasStarted(false)

  if (!hasStarted) return <WelcomePage onStart={handleStart} />

  return (
    <main className="min-h-screen bg-black">
      {/* Premium Hero with glassmorphism */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative py-16 overflow-hidden"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 animated-gradient opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />

        {/* Glass card effect */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <div className="glass rounded-2xl p-8 backdrop-blur-2xl border border-white/10">
            <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-gradient-x">
              Text Prompt Generator
            </h1>
            <p className="text-xl text-gray-300">Craft perfect AI prompts with our advanced builder</p>
          </div>
        </div>
      </motion.section>

      {/* Full width container with minimal padding */}
      <div className="w-full px-2 md:px-4">
        {/* Floating navigation */}
        <motion.div
          className="flex justify-between mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="ghost"
            onClick={handleBack}
            className="glass backdrop-blur-md border border-white/10 text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2" /> Back
          </Button>
          <div className="flex gap-3">
            <Link href="/gallery">
              <Button className="glass backdrop-blur-md border border-white/10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white hover:from-purple-500/30 hover:to-pink-500/30">
                <Sparkles className="mr-2 h-4 w-4" /> Gallery
              </Button>
            </Link>
            <Button
              onClick={() => window.open('https://github.com/yourusername/AI_PromptTools_Full', '_blank')}
              className="glass backdrop-blur-md border border-white/10 text-white hover:bg-white/10"
            >
              <Github className="mr-2 h-4 w-4" /> GitHub
            </Button>
          </div>
        </motion.div>

        {/* Full width unified prompt interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          <UnifiedPromptInterface onResults={setResults} results={results} />
        </motion.div>

        {/* Premium Attribution Footer */}
        <motion.footer
          className="mt-20 pt-8 border-t border-white/10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="glass-dark rounded-2xl p-8 backdrop-blur-2xl border border-white/10 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
              <p className="text-gray-300 text-lg">
                ✨ Built with <span className="text-red-500">❤️</span> and <span className="text-purple-400">AI Magic</span>
              </p>
              <Button
                onClick={() => window.open('https://github.com/yourusername/AI_PromptTools_Full', '_blank')}
                className="glass backdrop-blur-md border border-white/10 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-white hover:from-yellow-500/30 hover:to-orange-500/30"
                size="sm"
              >
                <Github className="mr-2 h-4 w-4" /> Star this project ⭐
              </Button>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              This tool is 100% free and open source. Join our community of AI prompt engineers and help us build the future! 🚀
            </p>
          </div>
        </motion.footer>
      </div>
      <Toaster />
    </main>
  )
}
