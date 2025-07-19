"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { fetchFromApi } from "@/lib/api"
import type { Prompt } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import { Image, Wand2, UploadCloud, Zap, Sparkles, Rocket } from "lucide-react"

// Constants for Image Generation
const AI_TOOLS = [
    { value: "midjourney", label: "Midjourney", icon: "🎨" },
    { value: "dall-e-3", label: "DALL-E 3", icon: "🤖" },
    { value: "stable-diffusion", label: "Stable Diffusion", icon: "🌀" },
]

const QUICK_TEMPLATES = [
    { value: "character", label: "Character Concept", description: "Design a unique character", icon: "👤" },
    { value: "environment", label: "Environment", description: "Create a stunning landscape", icon: "🏞️" },
    { value: "product", label: "Product Shot", description: "A commercial product photo", icon: "🛍️" },
    { value: "abstract", label: "Abstract Art", description: "Generate abstract visuals", icon: "✨" },
    { value: "logo", label: "Logo Concept", description: "Brainstorm a logo idea", icon: "✏️" },
]

const STYLES = [
    { value: "photorealistic", label: "Photorealistic" },
    { value: "fantasy-art", label: "Fantasy Art" },
    { value: "sci-fi-concept", label: "Sci-Fi Concept" },
    { value: "anime", label: "Anime" },
    { value: "pixel-art", label: "Pixel Art" },
    { value: "watercolor", label: "Watercolor" },
]

const MOODS = [
    { value: "dramatic", label: "Dramatic" },
    { value: "serene", label: "Serene" },
    { value: "whimsical", label: "Whimsical" },
    { value: "eerie", label: "Eerie" },
    { value: "joyful", label: "Joyful" },
]

const COMPOSITIONS = [
    { value: "close-up", label: "Close-up" },
    { value: "wide-shot", label: "Wide Shot" },
    { value: "portrait", label: "Portrait" },
    { value: "birds-eye-view", label: "Bird's Eye View" },
    { value: "dynamic-angle", label: "Dynamic Angle" },
]

const COMMERCIAL_TEMPLATES = [
    { value: "product-showcase", label: "Product Showcase" },
    { value: "brand-story", label: "Brand Story" },
    { value: "social-media-ad", label: "Social Media Ad" },
    { value: "website-hero", label: "Website Hero Image" },
]

export default function ImagePromptForm({ onResults }: { onResults: (results: Prompt[]) => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("advanced")
  const { toast } = useToast()
  
  // Shared state
  const [textPrompt, setTextPrompt] = useState("")
  const [aiTool, setAiTool] = useState("midjourney")
  
  // Advanced tab state
  const [style, setStyle] = useState("photorealistic")
  const [mood, setMood] = useState("dramatic")
  const [composition, setComposition] = useState("wide-shot")

  // Commercial tab state
  const [commercialTemplate, setCommercialTemplate] = useState("product-showcase")
  const [context, setContext] = useState("")

  // From Image tab state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [useCase, setUseCase] = useState("general")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleQuickGenerate = (template: string) => {
    if (!textPrompt.trim()) {
        toast({ title: "Error", description: "Please enter a description first.", variant: "destructive"})
        return
    }
    handleSubmit(null, { isQuick: true, quickTemplate: template })
  }

  const handleSubmit = async (e: React.FormEvent | null, options?: { isQuick: boolean, quickTemplate?: string }) => {
    e?.preventDefault()
    setIsLoading(true)

    try {
      let response
      if (activeTab === "from-image") {
        if (!imageFile) throw new Error("Please upload an image.")
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('use_case', useCase)
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/image/from-image`, {
            method: 'POST',
            body: formData,
        });
        if(!res.ok) throw new Error("Failed to upload image");
        response = await res.json();
      } else {
        if (!textPrompt.trim()) throw new Error("Please enter a description.")
        
        let body: any = { text_prompt: textPrompt, ai_tool: aiTool }

        if(options?.isQuick) {
            body.use_case = options.quickTemplate
        } else if (activeTab === "advanced") {
            body = { ...body, style, mood, composition }
        } else if (activeTab === "commercial") {
            body = { ...body, use_case: commercialTemplate, context }
        }

        response = await fetchFromApi<{ prompt: string }>("/image/from-text", {
          method: 'POST',
          body: JSON.stringify(body),
        })
      }

      onResults([{ id: "1", prompt: response.prompt }])
      toast({ title: "Prompt Generated" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Image /> Image Prompt Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quick"><Zap className="mr-2"/>Quick</TabsTrigger>
            <TabsTrigger value="advanced"><Sparkles className="mr-2"/>Advanced</TabsTrigger>
            <TabsTrigger value="commercial"><Rocket className="mr-2"/>Commercial</TabsTrigger>
            <TabsTrigger value="from-image"><UploadCloud className="mr-2"/>From Image</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <TabsContent value="quick" className="space-y-4">
                <Textarea placeholder="A lone astronaut on a red planet..." value={textPrompt} onChange={e => setTextPrompt(e.target.value)} />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {QUICK_TEMPLATES.map(template => (
                        <Button key={template.value} type="button" variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" onClick={() => handleQuickGenerate(template.value)}>
                            <span className="text-lg">{template.icon}</span>
                            <span className="font-medium">{template.label}</span>
                        </Button>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Textarea placeholder="A futuristic city skyline at dusk..." value={textPrompt} onChange={e => setTextPrompt(e.target.value)} />
               <div className="space-y-2">
                    <Label>AI Tool Optimization</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {AI_TOOLS.map(tool => (
                            <Button key={tool.value} type="button" variant={aiTool === tool.value ? "default" : "outline"} onClick={() => setAiTool(tool.value)}>
                                {tool.icon} {tool.label}
                            </Button>
                        ))}
                    </div>
                </div>
              <div className="grid grid-cols-3 gap-4">
                <Select value={style} onValueChange={setStyle}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{STYLES.map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
                <Select value={mood} onValueChange={setMood}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{MOODS.map(m=><SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select>
                <Select value={composition} onValueChange={setComposition}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{COMPOSITIONS.map(c=><SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select>
              </div>
            </TabsContent>

            <TabsContent value="commercial" className="space-y-4">
                 <Textarea placeholder="A new eco-friendly sneaker made of recycled materials..." value={textPrompt} onChange={e => setTextPrompt(e.target.value)} />
                <Select value={commercialTemplate} onValueChange={setCommercialTemplate}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{COMMERCIAL_TEMPLATES.map(t=><SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
                 <div className="space-y-2">
                    <Label>AI Tool</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {AI_TOOLS.map(tool => ( <Button key={tool.value} type="button" variant={aiTool === tool.value ? "default" : "outline"} onClick={() => setAiTool(tool.value)}> {tool.icon} {tool.label} </Button> ))}
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="from-image" className="space-y-4">
              <Input type="file" onChange={handleFileChange} accept="image/*" />
              {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-auto rounded-lg"/>}
              <Select value={useCase} onValueChange={setUseCase}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Description</SelectItem>
                  <SelectItem value="marketing">Marketing Copy</SelectItem>
                  <SelectItem value="blog">Blog/Article</SelectItem>
                </SelectContent>
              </Select>
            </TabsContent>

            {activeTab !== 'quick' && 
                <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Generating..." : "Generate Prompt"}
                </Button>
            }
          </form>
        </Tabs>
      </CardContent>
    </Card>
  )
} 