"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import type { Prompt } from "@/types"
import VideoPromptForm from "@/components/video-prompt-form"
import ImagePromptForm from "@/components/image-prompt-form"
import PromptResults from "@/components/prompt-results"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Film, Image as ImageIcon } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { cleanPromptText } from "@/lib/utils" // Import the utility

export default function MediaPromptPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "video")
  const [results, setResults] = useState<Prompt[]>([])
  const [usage, setUsage] = useState({ daily: 0, total: 0 })

  useEffect(() => {
    const savedResults = localStorage.getItem(`${activeTab}PromptResults`)
    if (savedResults) setResults(JSON.parse(savedResults))
    setUsage({ daily: activeTab === 'video' ? 3 : 1, total: activeTab === 'video' ? 45 : 15 })
  }, [activeTab])

  useEffect(() => {
    if (results.length) localStorage.setItem(`${activeTab}PromptResults`, JSON.stringify(results))
  }, [results, activeTab])

  const handleResults = (newResults: Prompt[]) => {
    const cleanedResults = newResults.map(result => ({
      ...result,
      prompt: cleanPromptText(result.prompt)
    }));
    setResults(cleanedResults);
  }
  const handleBack = () => router.push('/')

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`py-12 text-center text-white transition-colors duration-500 ${activeTab === 'video' ? 'bg-gradient-to-r from-rose-600 to-pink-600' : 'bg-gradient-to-r from-teal-600 to-cyan-600'}`}
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          {activeTab === 'video' ? 'Video Prompt Generator' : 'Image Prompt Generator'}
        </h1>
        <p className="text-xl">
          {activeTab === 'video' ? 'Create cinematic AI video prompts' : 'Generate precise prompts from vague ideas or existing images'}
        </p>
      </motion.section>

      <div className="w-full p-4 md:p-8">
        <div className="flex justify-between mb-6">
          <Button variant="ghost" onClick={handleBack}><ArrowLeft /> Back</Button>
          <div className="space-x-2">
            <Link href="/prompt"><Button>Text</Button></Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setResults([]) }} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="video"><Film className="mr-2"/>Video</TabsTrigger>
            <TabsTrigger value="image"><ImageIcon className="mr-2"/>Image</TabsTrigger>
          </TabsList>
          
          <div className="grid md:grid-cols-2 gap-4 md:gap-8 mt-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <TabsContent value="video">
                <VideoPromptForm onResults={handleResults} />
              </TabsContent>
              <TabsContent value="image">
                <ImagePromptForm onResults={handleResults} />
              </TabsContent>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              {results.length > 0 && <PromptResults results={results} />}
            </motion.div>
          </div>
        </Tabs>
      </div>
      <Toaster />
    </main>
  )
} 