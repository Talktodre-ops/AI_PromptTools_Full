"use client"

import { useState } from "react"
import { Copy, ExternalLink, ThumbsUp, ThumbsDown, Info, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { Prompt } from "@/types"

interface PromptCardProps {
  prompt: Prompt
  showExplanation?: boolean
}

export default function PromptCard({ prompt, showExplanation = false }: PromptCardProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt)
    setCopied(true)
    toast({
      title: "Copied",
      description: "Prompt copied to clipboard",
    })

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const handleUseInChatGPT = () => {
    const encodedPrompt = encodeURIComponent(prompt.prompt)
    window.open(`https://chat.openai.com/?prompt=${encodedPrompt}`, "_blank")
  }

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type)
    toast({
      title: "Feedback received",
      description: `Thank you for your ${type === "up" ? "positive" : "negative"} feedback!`,
    })

    // In a real implementation, this would send feedback to your backend
  }

  return (
    <Card className="overflow-hidden border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="prose dark:prose-invert max-w-none">
          <pre className="whitespace-pre-wrap text-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-md overflow-x-auto">
            {prompt.prompt.trim()}
          </pre>
        </div>

        {showExplanation && prompt.explanation && (
          <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700 dark:text-slate-300">{prompt.explanation}</p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-800 flex flex-wrap gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleCopy} className="text-slate-700 dark:text-slate-300">
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  Copy
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy prompt to clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseInChatGPT}
                  className="text-slate-700 dark:text-slate-300"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Use in ChatGPT
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open this prompt in ChatGPT</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={feedback === "up" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleFeedback("up")}
                  className={feedback === "up" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This prompt is helpful</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={feedback === "down" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleFeedback("down")}
                  className={feedback === "down" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This prompt needs improvement</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  )
}
