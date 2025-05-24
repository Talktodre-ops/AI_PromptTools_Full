"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { generatePrompts } from "@/lib/api"

const MODES = [
  { value: "basic", label: "Basic" },
  { value: "quick", label: "Quick" },
  { value: "deep", label: "Deep" },
  { value: "few-shot", label: "Few-Shot Examples" },
  { value: "cot", label: "Chain of Thought" },
]

const TONES = [
  { value: "default", label: "Default" },
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
]

const PERSONAS = [
  { value: "none", label: "None" },
  { value: "as a marketing expert", label: "Marketing Expert" },
  { value: "as a technical writer", label: "Technical Writer" },
  { value: "as a teacher", label: "Teacher" },
  { value: "as a business consultant", label: "Business Consultant" },
]

const FORMATS = [
  { value: "plain", label: "Plain Text" },
  { value: "markdown", label: "Markdown" },
  { value: "json", label: "JSON" },
]

export default function PromptForm({ onResults }: { onResults: (results: any) => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    input: "",
    mode: "deep",
    tone: "default",
    persona: "none",
    format: "plain"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await generatePrompts({
        raw_input: formData.input,
        mode: formData.mode,
        tone: formData.tone,
        persona: formData.persona === "none" ? "" : formData.persona,
        return_format: formData.format
      })

      if (response.data?.refined_prompts) {
        onResults(response.data.refined_prompts)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="prompt-input">Your Idea or Request</Label>
          <Textarea
            id="prompt-input"
            placeholder="Enter your idea, question, or task here. Be as specific as possible."
            value={formData.input}
            onChange={(e) => setFormData({ ...formData, input: e.target.value })}
            className="min-h-[200px] resize-y text-base"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Mode</Label>
            <Select
              value={formData.mode}
              onValueChange={(value) => setFormData({ ...formData, mode: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {MODES.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tone</Label>
            <Select
              value={formData.tone}
              onValueChange={(value) => setFormData({ ...formData, tone: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Persona</Label>
            <Select
              value={formData.persona}
              onValueChange={(value) => setFormData({ ...formData, persona: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select persona" />
              </SelectTrigger>
              <SelectContent>
                {PERSONAS.map((persona) => (
                  <SelectItem key={persona.value} value={persona.value}>
                    {persona.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Output Format</Label>
            <Select
              value={formData.format}
              onValueChange={(value) => setFormData({ ...formData, format: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          {isLoading ? "Generating..." : "Generate Prompts"}
        </Button>
      </form>
    </Card>
  )
}
