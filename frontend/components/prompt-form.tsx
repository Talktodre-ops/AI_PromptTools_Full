"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { generatePrompts, type PromptResponse, type PromptRequest, API_URL } from "@/lib/api"
import type { Prompt } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import { Sparkles, Zap, Wand2, BookOpen, Target } from "lucide-react"

// Enhanced template system
const PROMPT_TEMPLATES = {
	"Writing & Content": [
		{
			name: "Blog Post Writer",
			description: "Create engaging blog posts on any topic",
			prompt: "Write a comprehensive blog post about {topic}. Include an engaging introduction, detailed main content with subheadings, and a compelling conclusion. Target audience: {audience}. Tone: {tone}."
		},
		{
			name: "Email Copywriter",
			description: "Write compelling marketing emails",
			prompt: "Create a persuasive email for {purpose}. Subject line should be catchy and the body should include a clear call-to-action. Target audience: {audience}. Tone: {tone}."
		}
	],
	"Technical & Code": [
		{
			name: "Code Explainer",
			description: "Explain code functionality clearly",
			prompt: "Explain this code step by step: {code}. Include what it does, how it works, and any important concepts. Make it understandable for {level} level programmers."
		},
		{
			name: "API Documentation",
			description: "Create clear API documentation",
			prompt: "Create comprehensive API documentation for {endpoint}. Include description, parameters, response format, and usage examples."
		}
	],
	"Creative & Design": [
		{
			name: "Story Creator",
			description: "Generate creative stories",
			prompt: "Write a {genre} story about {theme}. Setting: {setting}. Include compelling characters and an engaging plot. Length: {length}."
		},
		{
			name: "Character Designer",
			description: "Design detailed characters",
			prompt: "Create a detailed character description for {type}. Include appearance, personality, background, and motivations. Setting: {setting}."
		}
	]
}

const PROMPT_MODES = [
	{ value: "basic", label: "Basic", description: "Simple prompt enhancement" },
	{ value: "quick", label: "Quick", description: "Fast optimization for immediate use" },
	{ value: "deep", label: "Deep", description: "Comprehensive prompt engineering" },
	{ value: "few-shot", label: "Few-shot", description: "Include examples in the prompt" },
	{ value: "cot", label: "Chain-of-Thought", description: "Step-by-step reasoning prompts" }
]

interface PromptFormProps {
	onResults: (results: Prompt[]) => void
}

export default function PromptForm({ onResults }: PromptFormProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [activeTab, setActiveTab] = useState("builder")
	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
	const [searchQuery, setSearchQuery] = useState("")
	const { toast } = useToast()

	const [formData, setFormData] = useState<PromptRequest>({
		raw_input: "",
		mode: "deep",
		tone: "professional",
		persona: "assistant",
		return_format: "plain",
		context: "",
		output_format: "paragraph",
		length: "medium",
		language: "en",
		custom_instructions: ""
	})

	// Save form data to localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('promptFormData', JSON.stringify(formData))
		}
	}, [formData])

	// Load saved form data
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('promptFormData')
			if (saved) {
				try {
					const savedData = JSON.parse(saved)
					setFormData(savedData)
				} catch (error) {
					console.error('Error loading saved form data:', error)
				}
			}
		}
	}, [])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!formData.raw_input.trim()) {
			toast({
				title: "Input Required",
				description: "Please enter your prompt text.",
				variant: "destructive"
			})
			return
		}

		setIsLoading(true)

		try {
			const response = await generatePrompts(formData)

			if (response.refined_prompts) {
				const results: Prompt[] = response.refined_prompts.map((prompt, index) => ({
					id: `${Date.now()}-${index}`,
					prompt: prompt
				}))

				onResults(results)

				toast({
					title: "Prompt Enhanced!",
					description: "Your prompt has been successfully improved.",
				})
			}
		} catch (error) {
			console.error("Error enhancing prompt:", error)
			toast({
				title: "Enhancement Failed",
				description: "There was an error enhancing your prompt. Please try again.",
				variant: "destructive"
			})
		} finally {
			setIsLoading(false)
		}
	}

	const handleQuickGenerate = async (mode: string) => {
		if (!formData.raw_input.trim()) {
			toast({
				title: "Input Required",
				description: "Please enter your prompt text.",
				variant: "destructive"
			})
			return
		}

		setIsLoading(true)

		try {
			const quickData = { ...formData, mode }
			const response = await generatePrompts(quickData)

			if (response.refined_prompts) {
				const results: Prompt[] = response.refined_prompts.map((prompt, index) => ({
					id: `${Date.now()}-${index}`,
					prompt: prompt
				}))

				onResults(results)
			}
		} catch (error) {
			console.error("Error with quick generation:", error)
			toast({
				title: "Generation Failed",
				description: "There was an error generating your prompt. Please try again.",
				variant: "destructive"
			})
		} finally {
			setIsLoading(false)
		}
	}

	const applyTemplate = (template: any) => {
		setFormData(prev => ({
			...prev,
			raw_input: template.prompt
		}))
		setSelectedTemplate(template.name)
		setActiveTab("builder")
	}

	const filteredTemplates = Object.entries(PROMPT_TEMPLATES).reduce((acc, [category, templates]) => {
		const filtered = templates.filter(template =>
			template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			template.description.toLowerCase().includes(searchQuery.toLowerCase())
		)
		if (filtered.length > 0) {
			(acc as any)[category] = filtered
		}
		return acc
	}, {} as typeof PROMPT_TEMPLATES)

	return (
		<Card className="overflow-hidden">
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Sparkles className="h-5 w-5 text-blue-600" />
						PROMPTHERO Generator
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="p-6">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="quick" className="flex items-center gap-2">
							<Zap className="h-4 w-4" />
							Quick Generate
						</TabsTrigger>
						<TabsTrigger value="builder" className="flex items-center gap-2">
							<Wand2 className="h-4 w-4" />
							Prompt Builder
						</TabsTrigger>
						<TabsTrigger value="templates" className="flex items-center gap-2">
							<BookOpen className="h-4 w-4" />
							Templates
						</TabsTrigger>
					</TabsList>

					<TabsContent value="quick" className="space-y-4">
						<div className="space-y-4">
							<div>
								<Label htmlFor="quick-input">Enter your prompt</Label>
								<Textarea
									id="quick-input"
									placeholder="Describe what you want to create..."
									value={formData.raw_input}
									onChange={(e) => setFormData(prev => ({ ...prev, raw_input: e.target.value }))}
									className="min-h-[120px] mt-2"
								/>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{PROMPT_MODES.slice(0, 4).map((mode) => (
									<Button
										key={mode.value}
										onClick={() => handleQuickGenerate(mode.value)}
										disabled={isLoading}
										variant="outline"
										className="h-auto p-3 flex flex-col items-start gap-1"
									>
										<span className="font-medium">{mode.label}</span>
										<span className="text-xs text-muted-foreground text-left">{mode.description}</span>
									</Button>
								))}
							</div>
						</div>
					</TabsContent>

					<TabsContent value="builder" className="space-y-6">
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="space-y-4">
								<div>
									<Label htmlFor="raw_input">Your Prompt</Label>
									<Textarea
										id="raw_input"
										placeholder="Enter your prompt that you want to enhance..."
										value={formData.raw_input}
										onChange={(e) => setFormData(prev => ({ ...prev, raw_input: e.target.value }))}
										className="min-h-[120px] mt-2"
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor="mode">Enhancement Mode</Label>
										<Select value={formData.mode} onValueChange={(value) => setFormData(prev => ({ ...prev, mode: value }))}>
											<SelectTrigger id="mode" className="mt-2">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{PROMPT_MODES.map((mode) => (
													<SelectItem key={mode.value} value={mode.value}>
														<div className="flex flex-col">
															<span>{mode.label}</span>
															<span className="text-xs text-muted-foreground">{mode.description}</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label htmlFor="tone">Tone</Label>
										<Select value={formData.tone} onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}>
											<SelectTrigger id="tone" className="mt-2">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="professional">Professional</SelectItem>
												<SelectItem value="casual">Casual</SelectItem>
												<SelectItem value="friendly">Friendly</SelectItem>
												<SelectItem value="formal">Formal</SelectItem>
												<SelectItem value="creative">Creative</SelectItem>
												<SelectItem value="technical">Technical</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label htmlFor="persona">AI Persona</Label>
										<Select value={formData.persona} onValueChange={(value) => setFormData(prev => ({ ...prev, persona: value }))}>
											<SelectTrigger id="persona" className="mt-2">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="assistant">Assistant</SelectItem>
												<SelectItem value="expert">Expert</SelectItem>
												<SelectItem value="teacher">Teacher</SelectItem>
												<SelectItem value="coach">Coach</SelectItem>
												<SelectItem value="analyst">Analyst</SelectItem>
												<SelectItem value="creative">Creative</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label htmlFor="length">Response Length</Label>
										<Select value={formData.length} onValueChange={(value) => setFormData(prev => ({ ...prev, length: value }))}>
											<SelectTrigger id="length" className="mt-2">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="brief">Brief</SelectItem>
												<SelectItem value="medium">Medium</SelectItem>
												<SelectItem value="detailed">Detailed</SelectItem>
												<SelectItem value="comprehensive">Comprehensive</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div>
									<Label htmlFor="context">Additional Context (Optional)</Label>
									<Textarea
										id="context"
										placeholder="Add any additional context or requirements..."
										value={formData.context}
										onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
										className="mt-2"
										rows={3}
									/>
								</div>
							</div>

							<Button
								type="submit"
								disabled={isLoading}
								className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
								size="lg"
							>
								{isLoading ? "Enhancing..." : "Enhance Prompt"}
								<Target className="ml-2 h-4 w-4" />
							</Button>
						</form>
					</TabsContent>

					<TabsContent value="templates" className="space-y-4">
						<div>
							<Input
								placeholder="Search templates..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="mb-4"
							/>
						</div>

						<div className="space-y-6">
							{Object.entries(filteredTemplates).map(([category, templates]) => (
								<div key={category}>
									<h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
										<BookOpen className="h-4 w-4" />
										{category}
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										{templates.map((template, index) => (
											<Card
												key={index}
												className={`cursor-pointer transition-all hover:shadow-md ${
													selectedTemplate === template.name ? 'ring-2 ring-blue-500' : ''
												}`}
												onClick={() => applyTemplate(template)}
											>
												<CardContent className="p-4">
													<div className="flex items-start justify-between">
														<div>
															<h4 className="font-medium">{template.name}</h4>
															<p className="text-sm text-muted-foreground mt-1">
																{template.description}
															</p>
														</div>
														{selectedTemplate === template.name && (
															<Badge variant="secondary" className="ml-2">
																Selected
															</Badge>
														)}
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</div>
							))}
						</div>

						{Object.keys(filteredTemplates).length === 0 && (
							<div className="text-center py-8 text-muted-foreground">
								No templates found matching your search.
							</div>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	)
}