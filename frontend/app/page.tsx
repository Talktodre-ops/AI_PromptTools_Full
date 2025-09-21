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
import { ArrowLeft, Film, Image, Github, Sparkles, Linkedin, Twitter, Instagram, Mail, Heart } from "lucide-react"
import { motion } from "framer-motion"

// Component that uses useSearchParams wrapped in Suspense
function SearchParamsHandler({ onHasStartedChange }: { onHasStartedChange: (hasStarted: boolean) => void }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Load states
    const view = searchParams.get('view')
    const hasStarted = view === 'prompt' || localStorage.getItem('hasStarted') === 'true'
    onHasStartedChange(hasStarted)
  }, [searchParams, onHasStartedChange])

  return null
}

function PageContent() {
  const [results, setResults] = useState<any[]>([])
  const [hasStarted, setHasStarted] = useState(false)
  const [currentPromptType, setCurrentPromptType] = useState("text")
  const router = useRouter()

  useEffect(() => {
    if (hasStarted) router.push('/?view=prompt')
    localStorage.setItem('hasStarted', hasStarted.toString())
  }, [hasStarted, router])

  const handleStart = () => setHasStarted(true)
  const handleBack = () => setHasStarted(false)
  const handleTabChange = (tab: string) => setCurrentPromptType(tab)

  const getHeaderText = () => {
    switch (currentPromptType) {
      case "video":
        return "Video Prompt Generator"
      case "image":
        return "Image Prompt Generator"
      default:
        return "Text Prompt Generator"
    }
  }

  if (!hasStarted) return (
    <>
      <Suspense fallback={<div className="hidden">Loading...</div>}>
        <SearchParamsHandler onHasStartedChange={setHasStarted} />
      </Suspense>
      <WelcomePage onStart={handleStart} />
    </>
  )

  return (
    <>
      <Suspense fallback={<div className="hidden">Loading...</div>}>
        <SearchParamsHandler onHasStartedChange={setHasStarted} />
      </Suspense>
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-gradient-x px-2">
                {getHeaderText()}
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 px-4">Craft perfect AI prompts with our advanced builder</p>
            </div>
          </div>
        </motion.section>

        {/* Full width container with minimal padding and bottom spacing for footer */}
        <div className="w-full px-2 sm:px-4 md:px-4 pb-20">
          {/* Floating navigation */}
          <motion.div
            className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="ghost"
              onClick={handleBack}
              className="glass backdrop-blur-md border border-white/10 text-white hover:bg-white/10 w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2" /> Back
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={() => router.push('/gallery')}
                className="glass backdrop-blur-md border border-white/10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white hover:from-purple-500/30 hover:to-pink-500/30 w-full sm:w-auto"
              >
                <Sparkles className="mr-2 h-4 w-4" /> Gallery
              </Button>
              <Button
                onClick={() => window.open('https://github.com/Talktodre-ops/AI_PromptTools_Full', '_blank')}
                className="glass backdrop-blur-md border border-white/10 text-white hover:bg-white/10 w-full sm:w-auto"
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
            <UnifiedPromptInterface onResults={setResults} results={results} onTabChange={handleTabChange} />
          </motion.div>

        </div>

        {/* Static Footer */}
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-white/10">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
              {/* Developer Attribution */}
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <span className="text-gray-400">Built with</span>
                <Heart className="h-3 sm:h-4 w-3 sm:w-4 text-red-500 fill-current" />
                <span className="text-gray-400">by</span>
                <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-bold">
                  @Talktodre-ops
                </span>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10"
                  onClick={() => window.open('https://www.linkedin.com/in/talktodre35/', '_blank')}
                >
                  <Linkedin className="h-3 sm:h-4 w-3 sm:w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10"
                  onClick={() => window.open('https://x.com/talktodre100', '_blank')}
                >
                  <Twitter className="h-3 sm:h-4 w-3 sm:w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-gray-400 hover:text-pink-400 hover:bg-pink-400/10"
                  onClick={() => window.open('https://www.instagram.com/talktodree/', '_blank')}
                >
                  <Instagram className="h-3 sm:h-4 w-3 sm:w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-gray-400 hover:text-green-400 hover:bg-green-400/10"
                  onClick={() => window.open('mailto:talktodre100@yahoo.com', '_blank')}
                >
                  <Mail className="h-3 sm:h-4 w-3 sm:w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10"
                  onClick={() => window.open('https://github.com/Talktodre-ops/AI_PromptTools_Full', '_blank')}
                >
                  <Github className="h-3 sm:h-4 w-3 sm:w-4" />
                </Button>
              </div>

              {/* Contact for collaboration */}
              <div className="text-xs text-gray-500 text-center sm:text-left">
                <span className="hidden sm:inline">Open for collaboration • </span>AI Development Partner
              </div>
            </div>
          </div>
        </footer>
        <Toaster />
      </main>
    </>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    }>
      <PageContent />
    </Suspense>
  )
}
