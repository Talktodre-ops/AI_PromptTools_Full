"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PromptCard from "@/components/prompt-card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Prompt } from "@/types"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  results: Prompt[]
}

export default function PromptResults({ results }: Props) {
  const { toast } = useToast()
  const [showExplanation, setShowExplanation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleCopyAll = () => {
    const allPrompts = results.map((result) => result.prompt).join("\n\n---\n\n")
    navigator.clipboard.writeText(allPrompts)
    toast({
      title: "All prompts copied",
      description: "All prompts have been copied to your clipboard.",
    })
  }

  // Add console.log to debug incoming results
  console.log('Rendering results:', results)

  if (!results.length) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Your Engineered Prompts
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExplanation(!showExplanation)}
          >
            {showExplanation ? "Hide" : "Show"} Explanations
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyAll}>
            Copy All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {results.map((prompt, index) => (
          <PromptCard
            key={index}
            prompt={prompt}
            showExplanation={showExplanation}
          />
        ))}
      </div>

      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.id} className="overflow-hidden">
            <CardContent className="p-4">
              <pre className="whitespace-pre-wrap text-sm">
                {result.prompt}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
