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
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { fetchFromApi, type PromptResponse, type PromptRequest, API_URL } from "@/lib/api"
import type { Prompt } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import { cleanPromptText, UsageTracker, PromptHistory } from "@/lib/utils"
import { Sparkles, Zap, Wand2, BookOpen, Target, Lightbulb, Crown, AlertTriangle, TrendingUp } from "lucide-react"

// Enhanced template system
const PROMPT_TEMPLATES = {
	"Writing & Content": [
		{
			id: "blog-post",
			title: "Blog Post",
			description: "Create engaging blog content",
			template: "Write a comprehensive blog post about [TOPIC]. Include an engaging introduction, main points with examples, and a compelling conclusion.",
			tags: ["content", "writing", "blog"],
			icon: "📝"
		},
		{
			id: "social-media",
			title: "Social Media Post",
			description: "Create viral social content",
			template: "Create an engaging social media post about [TOPIC]. Make it attention-grabbing with a hook, value, and call-to-action.",
			tags: ["social", "marketing", "content"],
			icon: "📱"
		},
		{
			id: "email-marketing",
			title: "Email Marketing",
			description: "Write compelling email campaigns",
			template: "Write a persuasive email about [TOPIC] with a compelling subject line, engaging opening, clear benefits, and strong call-to-action.",
			tags: ["email", "marketing", "sales"],
			icon: "📧"
		}
	],
	"Business & Marketing": [
		{
			id: "product-description",
			title: "Product Description",
			description: "Create compelling product copy",
			template: "Write a compelling product description for [PRODUCT]. Highlight key features, benefits, and why customers should buy it.",
			tags: ["product", "ecommerce", "sales"],
			icon: "🏷️"
		},
		{
			id: "business-plan",
			title: "Business Plan",
			description: "Create business strategy documents",
			template: "Create a business plan section for [BUSINESS CONCEPT]. Include market analysis, target audience, value proposition, and implementation strategy.",
			tags: ["business", "strategy", "planning"],
			icon: "📊"
		},
		{
			id: "press-release",
			title: "Press Release",
			description: "Write professional press releases",
			template: "Write a professional press release about [NEWS/ANNOUNCEMENT]. Include headline, key details, quotes, and company information.",
			tags: ["pr", "marketing", "news"],
			icon: "📰"
		}
	],
	"Technical & Code": [
		{
			id: "code-documentation",
			title: "Code Documentation",
			description: "Document your code professionally",
			template: "Create comprehensive documentation for [CODE/PROJECT]. Include overview, installation, usage examples, and API reference.",
			tags: ["code", "documentation", "tech"],
			icon: "💻"
		},
		{
			id: "technical-tutorial",
			title: "Technical Tutorial",
			description: "Create step-by-step tutorials",
			template: "Create a step-by-step tutorial for [TECHNICAL TOPIC]. Include prerequisites, detailed steps, code examples, and troubleshooting tips.",
			tags: ["tutorial", "tech", "education"],
			icon: "🔧"
		},
		{
			id: "api-specification",
			title: "API Specification",
			description: "Document API endpoints",
			template: "Create API documentation for [API/ENDPOINT]. Include endpoint details, parameters, request/response examples, and error codes.",
			tags: ["api", "documentation", "tech"],
			icon: "🔗"
		}
	],
	"Creative & Design": [
		{
			id: "creative-brief",
			title: "Creative Brief",
			description: "Define creative project requirements",
			template: "Create a creative brief for [PROJECT]. Include objectives, target audience, key messages, visual style, and deliverables.",
			tags: ["creative", "design", "brief"],
			icon: "🎨"
		},
		{
			id: "story-outline",
			title: "Story Outline",
			description: "Structure your narrative",
			template: "Create a story outline for [STORY CONCEPT]. Include characters, plot structure, key scenes, and themes.",
			tags: ["story", "creative", "writing"],
			icon: "📚"
		},
		{
			id: "video-script",
			title: "Video Script",
			description: "Write engaging video content",
			template: "Write a video script for [VIDEO TOPIC]. Include hook, main content, visual cues, and call-to-action.",
			tags: ["video", "script", "content"],
			icon: "🎬"
		}
	]
}

const MODES = [
	{ value: "basic", label: "Basic", description: "Simple and direct prompts", icon: "⚡" },
	{ value: "quick", label: "Quick", description: "Fast, one-line prompts", icon: "🚀" },
	{ value: "deep", label: "Deep", description: "Detailed, comprehensive prompts", icon: "🎯" },
	{ value: "few-shot", label: "Few-Shot", description: "Prompts with examples", icon: "📖" },
	{ value: "cot", label: "Chain of Thought", description: "Step-by-step reasoning", icon: "🧠" },
	{ value: "video", label: "Video", description: "Video generation prompts", icon: "🎬" },
]

const TONES = [
	{ value: "default", label: "Default", description: "Balanced and neutral" },
	{ value: "formal", label: "Formal", description: "Professional and official" },
	{ value: "friendly", label: "Friendly", description: "Warm and approachable" },
	{ value: "professional", label: "Professional", description: "Business-focused" },
	{ value: "casual", label: "Casual", description: "Relaxed and informal" },
	{ value: "enthusiastic", label: "Enthusiastic", description: "Energetic and excited" },
	{ value: "authoritative", label: "Authoritative", description: "Confident and expert" },
]

const PERSONAS = [
	{ value: "none", label: "None", description: "No specific persona" },
	{ value: "as a marketing expert", label: "Marketing Expert", description: "Marketing and advertising specialist" },
	{ value: "as a technical writer", label: "Technical Writer", description: "Technical documentation expert" },
	{ value: "as a teacher", label: "Teacher", description: "Educational and instructional" },
	{ value: "as a business consultant", label: "Business Consultant", description: "Strategic business advisor" },
	{ value: "as a creative director", label: "Creative Director", description: "Creative and artistic vision" },
	{ value: "as a data analyst", label: "Data Analyst", description: "Data-driven insights" },
]

const FORMATS = [
	{ value: "plain", label: "Plain Text", description: "Simple text format" },
	{ value: "markdown", label: "Markdown", description: "Structured markdown" },
	{ value: "json", label: "JSON", description: "Structured data format" },
]

interface Props {
  onResults: (results: Prompt[]) => void
}

export default function PromptForm({ onResults }: Props) {
	const [isLoading, setIsLoading] = useState(false)
	const [activeTab, setActiveTab] = useState("builder")
	const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
	const [searchQuery, setSearchQuery] = useState("")
	const [usageStats, setUsageStats] = useState(UsageTracker.getUsageStats())
	const [remainingUsage, setRemainingUsage] = useState(UsageTracker.getRemainingUsage())
	const { toast } = useToast()
	
	const [formData, setFormData] = useState<PromptRequest>({
		raw_input: "",
		mode: "deep",
		tone: "default",
		persona: "none",
		return_format: "plain",
	})

	// Update usage stats on component mount and when usage changes
	useEffect(() => {
		const updateUsageStats = () => {
			setUsageStats(UsageTracker.getUsageStats())
			setRemainingUsage(UsageTracker.getRemainingUsage())
		}

		updateUsageStats()
		
		// Update every minute to handle daily resets
		const interval = setInterval(updateUsageStats, 60000)
		return () => clearInterval(interval)
	}, [])

	// Load saved form data from localStorage on component mount
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedFormData = localStorage.getItem('promptFormData')
			if (savedFormData) {
				try {
					const parsedFormData = JSON.parse(savedFormData)
					setFormData(parsedFormData)
				} catch (e) {
					console.error('Error parsing saved form data:', e)
				}
			}
		}
	}, [])

	// Save form data to localStorage whenever it changes
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('promptFormData', JSON.stringify(formData))
		}
	}, [formData])

	const checkUsageLimit = (): boolean => {
		if (remainingUsage.daily === 0) {
			toast({
				title: "Daily Limit Reached",
				description: `You've reached your daily limit of ${UsageTracker.getLimitsForTier(usageStats.userTier).dailyPrompts} prompts. Upgrade to Pro for more prompts!`,
				variant: "destructive"
			})
			return false
		}

		if (remainingUsage.total === 0) {
			toast({
				title: "Total Limit Reached",
				description: "You've reached your total prompt limit. Upgrade to Pro for unlimited prompts!",
				variant: "destructive"
			})
			return false
		}

		return true
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		if (!checkUsageLimit()) {
			return
		}

		setIsLoading(true)

		try {
			// Check if input is empty
			if (!formData.raw_input.trim()) {
				throw new Error("Please enter your idea or request");
			}

			// Check if user can use the selected mode
			if (!UsageTracker.canUseFeature(formData.mode)) {
				throw new Error(`${formData.mode} mode is not available in your current plan. Upgrade to Pro!`);
			}

			// Increment usage before making the API call
			if (!UsageTracker.incrementUsage()) {
				throw new Error("Usage limit exceeded");
			}

			console.log('Sending request to API:', API_URL + '/refine');
			const response = await fetchFromApi<PromptResponse>('/refine', {
				method: 'POST',
				body: JSON.stringify(formData)
			})

			if (response.refined_prompts) {
				const prompts: Prompt[] = response.refined_prompts.map((promptText: string, index: number) => ({
					id: index.toString(),
					prompt: promptText
				}))
				
				console.log('Transformed Prompts:', prompts)
				onResults(prompts)

				// Save to history
				const enhancedPrompt = prompts.map(p => p.prompt).join('\n\n')
				const currentTemplate = selectedTemplate ? Object.values(PROMPT_TEMPLATES).flat().find(t => t.id === selectedTemplate) : null
				
				PromptHistory.savePrompt({
					originalPrompt: formData.raw_input,
					enhancedPrompt,
					mode: formData.mode,
					isFavorite: false,
					tags: currentTemplate ? currentTemplate.tags : [],
					category: currentTemplate ? Object.keys(PROMPT_TEMPLATES).find(category => 
						PROMPT_TEMPLATES[category as keyof typeof PROMPT_TEMPLATES].some(t => t.id === selectedTemplate)
					) : undefined,
					templateUsed: currentTemplate?.title
				})

				// Update usage stats after successful generation
				setUsageStats(UsageTracker.getUsageStats())
				setRemainingUsage(UsageTracker.getRemainingUsage())

				// Show success message with remaining usage
				const newRemaining = UsageTracker.getRemainingUsage()
				toast({
					title: "Prompts Generated",
					description: `${newRemaining.daily === -1 ? 'Unlimited' : newRemaining.daily} prompts remaining today`
				})
			} else {
				throw new Error("No prompts were returned from the API");
			}
		} catch (error) {
			console.error('Form submission error:', error)
			
			let errorMessage = "Failed to process prompt";
			
			if (error instanceof Error) {
				if (error.message.includes("404")) {
					errorMessage = "Cannot connect to the backend API. Please make sure the backend server is running at http://localhost:8000";
				} else {
					errorMessage = error.message;
				}
			}
			
			toast({
				title: "Error",
				description: errorMessage,
				variant: "destructive"
			})
		} finally {
			setIsLoading(false)
		}
	}

	// Update form data when a field changes
	const updateFormData = (field: keyof PromptRequest, value: string) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}))
	}

	// Handle template selection
	const handleTemplateSelect = (template: any) => {
		setSelectedTemplate(template.id)
		updateFormData('raw_input', template.template)
		setActiveTab("builder")
		
		toast({
			title: "Template Applied",
			description: `${template.title} template has been applied. Customize it as needed.`
		})
	}

	// Handle one-click generation
	const handleQuickGenerate = async (mode: string, tone: string = "default") => {
		if (!formData.raw_input.trim()) {
			toast({
				title: "Error",
				description: "Please enter your idea or request first",
				variant: "destructive"
			})
			return
		}

		if (!checkUsageLimit()) {
			return
		}

		if (!UsageTracker.canUseFeature(mode)) {
			toast({
				title: "Feature Unavailable",
				description: `${mode} mode is not available in your current plan. Upgrade to Pro!`,
				variant: "destructive"
			})
			return
		}

		setIsLoading(true)
		
		try {
			// Increment usage before making the API call
			if (!UsageTracker.incrementUsage()) {
				throw new Error("Usage limit exceeded");
			}

			const quickFormData = {
				...formData,
				mode,
				tone
			}

			const response = await fetchFromApi<PromptResponse>('/refine', {
				method: 'POST',
				body: JSON.stringify(quickFormData)
			})

			if (response.refined_prompts) {
				const prompts: Prompt[] = response.refined_prompts.map((promptText: string, index: number) => ({
					id: index.toString(),
					prompt: promptText
				}))
				
				onResults(prompts)

				// Save to history
				const enhancedPrompt = prompts.map(p => p.prompt).join('\n\n')
				const currentTemplate = selectedTemplate ? Object.values(PROMPT_TEMPLATES).flat().find(t => t.id === selectedTemplate) : null
				
				PromptHistory.savePrompt({
					originalPrompt: formData.raw_input,
					enhancedPrompt,
					mode: quickFormData.mode,
					isFavorite: false,
					tags: currentTemplate ? currentTemplate.tags : [],
					category: currentTemplate ? Object.keys(PROMPT_TEMPLATES).find(category => 
						PROMPT_TEMPLATES[category as keyof typeof PROMPT_TEMPLATES].some(t => t.id === selectedTemplate)
					) : undefined,
					templateUsed: currentTemplate?.title
				})

				// Update usage stats after successful generation
				setUsageStats(UsageTracker.getUsageStats())
				setRemainingUsage(UsageTracker.getRemainingUsage())

				// Show success message
				const newRemaining = UsageTracker.getRemainingUsage()
				toast({
					title: "Prompt Generated",
					description: `${newRemaining.daily === -1 ? 'Unlimited' : newRemaining.daily} prompts remaining today`
				})
			}
		} catch (error) {
			console.error('Quick generate error:', error)
			toast({
				title: "Error",
				description: "Failed to generate quick prompt",
				variant: "destructive"
			})
		} finally {
			setIsLoading(false)
		}
	}

	// Filter templates based on search
	const filteredTemplates = Object.entries(PROMPT_TEMPLATES).reduce((acc, [category, templates]) => {
		const filtered = templates.filter(template =>
			template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
		)
		if (filtered.length > 0) {
			acc[category as keyof typeof PROMPT_TEMPLATES] = filtered
		}
		return acc
	}, {} as typeof PROMPT_TEMPLATES)

	const usagePercentage = UsageTracker.getUsagePercentage()
	const limits = UsageTracker.getLimitsForTier(usageStats.userTier)

	return (
		<Card className="overflow-hidden">
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Sparkles className="h-5 w-5 text-blue-600" />
						PROMPTHERO Generator
					</CardTitle>
					<div className="flex items-center gap-2">
						{usageStats.userTier === 'free' && (
							<Badge variant="outline" className="flex items-center gap-1">
								<Crown className="h-3 w-3" />
								Free Plan
							</Badge>
						)}
						{usageStats.userTier === 'pro' && (
							<Badge variant="default" className="flex items-center gap-1 bg-blue-600">
								<Crown className="h-3 w-3" />
								Pro Plan
							</Badge>
						)}
						{usageStats.userTier === 'enterprise' && (
							<Badge variant="default" className="flex items-center gap-1 bg-purple-600">
								<Crown className="h-3 w-3" />
								Enterprise
							</Badge>
						)}
					</div>
				</div>

				{/* Usage Indicator */}
				{usageStats.userTier === 'free' && (
					<div className="space-y-2 mt-4">
						<div className="flex items-center justify-between text-sm">
							<span className="text-slate-600 dark:text-slate-400">
								Daily usage: {usageStats.dailyPrompts}/{limits.dailyPrompts}
							</span>
							<span className="text-slate-600 dark:text-slate-400">
								{remainingUsage.daily} remaining
							</span>
						</div>
						<Progress value={usagePercentage} className="h-2" />
						
						{usagePercentage >= 80 && (
							<Alert className="mt-2">
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription>
									You're running low on daily prompts. {' '}
									<Button variant="link" className="p-0 h-auto text-blue-600">
										Upgrade to Pro
									</Button>
									{' '} for unlimited prompts!
								</AlertDescription>
							</Alert>
						)}
					</div>
				)}
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

					<TabsContent value="quick" className="space-y-6">
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="quick-input">Your Idea or Request</Label>
								<Textarea
									id="quick-input"
									placeholder="Enter your idea, question, or task here..."
									value={formData.raw_input}
									onChange={(e) => updateFormData('raw_input', e.target.value)}
									className="min-h-[120px] resize-y text-base"
								/>
							</div>

							<div className="space-y-4">
								<Label>One-Click Generation</Label>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
									{MODES.slice(0, 5).map((mode) => {
										const canUse = UsageTracker.canUseFeature(mode.value)
										return (
											<Button
												key={mode.value}
												type="button"
												variant="outline"
												className={`h-auto p-4 flex flex-col items-center gap-2 ${canUse 
													? 'hover:bg-blue-50 hover:border-blue-200' 
													: 'opacity-50 cursor-not-allowed'
												}`}
												onClick={() => canUse && handleQuickGenerate(mode.value)}
												disabled={isLoading || !canUse || remainingUsage.daily === 0}
											>
												<span className="text-lg">{mode.icon}</span>
												<span className="font-medium">{mode.label}</span>
												<span className="text-xs text-muted-foreground text-center">
													{mode.description}
												</span>
												{!canUse && (
													<Badge variant="secondary" className="text-xs">
														Pro Only
													</Badge>
												)}
											</Button>
										)
									})}
								</div>
							</div>

							<div className="space-y-4">
								<Label>Tone Variations</Label>
								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
									{TONES.slice(1, 7).map((tone) => (
										<Button
											key={tone.value}
											type="button"
											variant="outline"
											size="sm"
											className="justify-start text-sm"
											onClick={() => handleQuickGenerate(formData.mode, tone.value)}
											disabled={isLoading || remainingUsage.daily === 0 || !UsageTracker.canUseFeature(formData.mode)}
										>
											{tone.label}
										</Button>
									))}
								</div>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="builder" className="space-y-6">
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="prompt-input">Your Idea or Request</Label>
								<Textarea
									id="prompt-input"
									placeholder="Enter your idea, question, or task here. Be as specific as possible."
									value={formData.raw_input}
									onChange={(e) => updateFormData('raw_input', e.target.value)}
									className="min-h-[200px] resize-y text-base"
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-4">
									<div className="space-y-2">
										<Label>Mode</Label>
										<Select
											value={formData.mode}
											onValueChange={(value) => updateFormData('mode', value)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select mode" />
											</SelectTrigger>
											<SelectContent>
												{MODES.map((mode) => {
													const canUse = UsageTracker.canUseFeature(mode.value)
													return (
														<SelectItem 
															key={mode.value} 
															value={mode.value}
															disabled={!canUse}
														>
															<div className="flex items-center gap-2">
																<span>{mode.icon}</span>
																<div className="flex flex-col">
																	<div className="flex items-center gap-2">
																		<span>{mode.label}</span>
																		{!canUse && (
																			<Badge variant="secondary" className="text-xs">
																				Pro
																			</Badge>
																		)}
																	</div>
																	<span className="text-xs text-muted-foreground">
																		{mode.description}
																	</span>
																</div>
															</div>
														</SelectItem>
													)
												})}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label>Tone</Label>
										<Select
											value={formData.tone}
											onValueChange={(value) => updateFormData('tone', value)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select tone" />
											</SelectTrigger>
											<SelectContent>
												{TONES.map((tone) => (
													<SelectItem key={tone.value} value={tone.value}>
														<div className="flex flex-col">
															<span>{tone.label}</span>
															<span className="text-xs text-muted-foreground">
																{tone.description}
															</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="space-y-4">
									<div className="space-y-2">
										<Label>Persona</Label>
										<Select
											value={formData.persona}
											onValueChange={(value) => updateFormData('persona', value)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select persona" />
											</SelectTrigger>
											<SelectContent>
												{PERSONAS.map((persona) => (
													<SelectItem key={persona.value} value={persona.value}>
														<div className="flex flex-col">
															<span>{persona.label}</span>
															<span className="text-xs text-muted-foreground">
																{persona.description}
															</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label>Output Format</Label>
										<Select
											value={formData.return_format}
											onValueChange={(value) => updateFormData('return_format', value)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select format" />
											</SelectTrigger>
											<SelectContent>
												{FORMATS.map((format) => (
													<SelectItem key={format.value} value={format.value}>
														<div className="flex flex-col">
															<span>{format.label}</span>
															<span className="text-xs text-muted-foreground">
																{format.description}
															</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>

							<Button
								type="submit"
								disabled={isLoading || remainingUsage.daily === 0 || !UsageTracker.canUseFeature(formData.mode)}
								className="w-full md:w-auto"
							>
								{isLoading ? "Generating..." : "Generate Prompts"}
							</Button>
						</form>
					</TabsContent>

					<TabsContent value="templates" className="space-y-6">
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="flex-1">
									<Label htmlFor="template-search">Search Templates</Label>
									<Input
										id="template-search"
										placeholder="Search by name, description, or tags..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="mt-1"
									/>
								</div>
							</div>

							<div className="space-y-6">
								{Object.entries(filteredTemplates).map(([category, templates]) => (
									<div key={category} className="space-y-3">
										<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
											{category}
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{templates.map((template) => (
												<Card
													key={template.id}
													className={`cursor-pointer hover:shadow-md transition-all ${
														selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
													}`}
													onClick={() => handleTemplateSelect(template)}
												>
													<CardContent className="p-4">
														<div className="flex items-start gap-3">
															<span className="text-2xl">{template.icon}</span>
															<div className="flex-1 min-w-0">
																<h4 className="font-medium text-slate-800 dark:text-slate-200 truncate">
																	{template.title}
																</h4>
																<p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
																	{template.description}
																</p>
																<div className="flex flex-wrap gap-1 mt-2">
																	{template.tags.map((tag) => (
																		<Badge key={tag} variant="secondary" className="text-xs">
																			{tag}
																		</Badge>
																	))}
																</div>
															</div>
														</div>
													</CardContent>
												</Card>
											))}
										</div>
									</div>
								))}
							</div>

							{Object.keys(filteredTemplates).length === 0 && (
								<div className="text-center py-8">
									<Target className="h-12 w-12 mx-auto text-slate-400 mb-4" />
									<h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">
										No templates found
									</h3>
									<p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
										Try adjusting your search terms
									</p>
								</div>
							)}
						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	)
}
