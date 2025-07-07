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
import { fetchFromApi, type PromptResponse, type VideoPromptRequest, API_URL } from "@/lib/api"
import type { Prompt } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import { cleanPromptText } from "@/lib/utils"
import { Film, Sparkles, Rocket, Zap } from "lucide-react"

// Enhanced options based on backend templates
const TOOLS = [
	{ value: "runway", label: "Runway ML", description: "Professional video generation", icon: "🎬" },
	{ value: "pika", label: "Pika Labs", description: "Creative and artistic", icon: "🎨" },
	{ value: "sora", label: "OpenAI Sora", description: "Narrative storytelling", icon: "📖" },
]

const CAMERA_ANGLES = [
	{ value: "aerial", label: "Aerial/Drone", description: "Drone-like perspective" },
	{ value: "eye-level", label: "Eye Level", description: "Natural human perspective" },
	{ value: "low-angle", label: "Low Angle", description: "Looking up at subject" },
	{ value: "high-angle", label: "High Angle", description: "Looking down at subject" },
	{ value: "birds-eye", label: "Bird's Eye View", description: "Directly overhead" },
	{ value: "dutch-angle", label: "Dutch Angle", description: "Tilted camera angle" },
]

const LIGHTING = [
	{ value: "natural", label: "Natural Light", description: "Natural lighting conditions" },
	{ value: "golden_hour", label: "Golden Hour", description: "Warm sunset/sunrise light" },
	{ value: "blue_hour", label: "Blue Hour", description: "Cool twilight atmosphere" },
	{ value: "studio", label: "Studio Lighting", description: "Controlled professional lighting" },
	{ value: "low_key", label: "Low Key", description: "Dramatic shadows and contrast" },
	{ value: "high_key", label: "High Key", description: "Bright and airy lighting" },
]

const MOVEMENT = [
	{ value: "static", label: "Static", description: "Fixed camera position" },
	{ value: "pan", label: "Pan", description: "Horizontal camera movement" },
	{ value: "tilt", label: "Tilt", description: "Vertical camera movement" },
	{ value: "zoom", label: "Zoom", description: "Focal length change" },
	{ value: "dolly", label: "Dolly", description: "Camera depth movement" },
	{ value: "tracking", label: "Tracking Shot", description: "Following subject movement" },
]

const STYLES = [
	{ value: "cinematic", label: "Cinematic", description: "Professional film-like quality" },
	{ value: "commercial", label: "Commercial", description: "Polished marketing style" },
	{ value: "documentary", label: "Documentary", description: "Natural and authentic feel" },
	{ value: "music_video", label: "Music Video", description: "Dynamic and artistic" },
	{ value: "vintage", label: "Vintage", description: "Retro and nostalgic" },
	{ value: "modern", label: "Modern", description: "Contemporary and sleek" },
]

const QUALITY = [
	{ value: "4k", label: "4K UHD", description: "Ultra-high definition quality" },
	{ value: "cinematic", label: "Cinematic", description: "Professional film quality" },
	{ value: "hdr", label: "HDR", description: "High dynamic range" },
	{ value: "film_grain", label: "Film Grain", description: "Authentic film texture" },
	{ value: "smooth", label: "Smooth", description: "High frame rate motion" },
]

const COMMERCIAL_TYPES = [
	{ value: "product_showcase", label: "Product Showcase", description: "Highlight product features" },
	{ value: "brand_story", label: "Brand Story", description: "Emotional brand narrative" },
	{ value: "social_media", label: "Social Media", description: "Platform-optimized content" },
	{ value: "explainer", label: "Explainer", description: "Educational and instructional" },
]

const QUICK_TEMPLATES = [
	{ value: "cinematic", label: "Cinematic", description: "Professional film-like scenes", icon: "🎬" },
	{ value: "commercial", label: "Commercial", description: "Marketing and advertising", icon: "💼" },
	{ value: "social", label: "Social Media", description: "Platform-ready content", icon: "📱" },
	{ value: "documentary", label: "Documentary", description: "Authentic storytelling", icon: "📹" },
	{ value: "artistic", label: "Artistic", description: "Creative and experimental", icon: "🎨" },
]

const FORMATS = [
	{ value: "plain", label: "Plain Text" },
	{ value: "markdown", label: "Markdown" },
	{ value: "json", label: "JSON" },
]

interface Props {
  onResults: (results: Prompt[]) => void
}

export default function VideoPromptForm({ onResults }: Props) {
	const [isLoading, setIsLoading] = useState(false)
	const [activeTab, setActiveTab] = useState("advanced")
	const { toast } = useToast()
	
	const [formData, setFormData] = useState<VideoPromptRequest>({
		raw_input: "",
		camera_angle: "aerial",
		lighting: "natural",
		movement: "static",
		style: "cinematic",
		tone: "default",
		return_format: "plain",
		tool_type: "runway",
		quality: "4k",
		commercial_type: undefined,
		context_details: undefined,
	})

	const [quickTemplate, setQuickTemplate] = useState("cinematic")

	// Load saved form data from localStorage on component mount
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedFormData = localStorage.getItem('videoPromptFormData')
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
			localStorage.setItem('videoPromptFormData', JSON.stringify(formData))
		}
	}, [formData])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			// Check if input is empty
			if (!formData.raw_input.trim()) {
				throw new Error("Please enter your video scene idea");
			}

			const endpoint = activeTab === "quick" ? "/video/quick" : "/video"
			const requestData = activeTab === "quick" 
				? { raw_input: formData.raw_input, template_type: quickTemplate }
				: formData

			console.log('Sending request to API:', API_URL + endpoint)
			const response = await fetchFromApi<PromptResponse>(endpoint, {
				method: 'POST',
				body: JSON.stringify(requestData)
			})

			if (response.refined_prompts) {
				const prompts: Prompt[] = response.refined_prompts.map((promptText: string, index: number) => ({
					id: index.toString(),
					prompt: promptText
				}))
				
				console.log('Transformed Prompts:', prompts)
				onResults(prompts)
			} else {
				throw new Error("No prompts were returned from the API");
			}
		} catch (error) {
			console.error('Form submission error:', error)
			
			let errorMessage = "Failed to process video prompt";
			
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
	const updateFormData = (field: keyof VideoPromptRequest, value: string | undefined) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}))
	}

	const handleQuickGenerate = async (template: string) => {
		if (!formData.raw_input.trim()) {
			toast({
				title: "Error",
				description: "Please enter your video scene idea first",
				variant: "destructive"
			})
			return
		}

		setQuickTemplate(template)
		setIsLoading(true)

		try {
			const response = await fetchFromApi<PromptResponse>("/video/quick", {
				method: 'POST',
				body: JSON.stringify({
					raw_input: formData.raw_input,
					template_type: template
				})
			})

			if (response.refined_prompts) {
				const prompts: Prompt[] = response.refined_prompts.map((promptText: string, index: number) => ({
					id: index.toString(),
					prompt: promptText
				}))
				
				onResults(prompts)
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

	return (
		<Card className="overflow-hidden">
			<CardHeader className="pb-4">
				<CardTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
					<Film className="h-5 w-5" />
					Video Prompt Generator
				</CardTitle>
			</CardHeader>
			<CardContent className="p-6">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="quick" className="flex items-center gap-2">
							<Zap className="h-4 w-4" />
							Quick
						</TabsTrigger>
						<TabsTrigger value="advanced" className="flex items-center gap-2">
							<Sparkles className="h-4 w-4" />
							Advanced
						</TabsTrigger>
						<TabsTrigger value="commercial" className="flex items-center gap-2">
							<Rocket className="h-4 w-4" />
							Commercial
						</TabsTrigger>
					</TabsList>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="video-prompt-input">Your Video Scene Idea</Label>
							<Textarea
								id="video-prompt-input"
								placeholder="Describe the video scene you want to create. For example: 'A drone flying over a misty forest at sunrise'"
								value={formData.raw_input}
								onChange={(e) => updateFormData('raw_input', e.target.value)}
								className="min-h-[120px] resize-y text-base"
							/>
						</div>

						<TabsContent value="quick" className="space-y-6">
							<div className="space-y-4">
								<Label>Quick Templates</Label>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
									{QUICK_TEMPLATES.map((template) => (
										<Button
											key={template.value}
											type="button"
											variant={quickTemplate === template.value ? "default" : "outline"}
											className="h-auto p-4 flex flex-col items-center gap-2"
											onClick={() => handleQuickGenerate(template.value)}
											disabled={isLoading}
										>
											<span className="text-lg">{template.icon}</span>
											<span className="font-medium">{template.label}</span>
											<span className="text-xs text-muted-foreground text-center">
												{template.description}
											</span>
										</Button>
									))}
								</div>
							</div>
						</TabsContent>

						<TabsContent value="advanced" className="space-y-6">
							<div className="space-y-4">
								<Label>AI Tool Optimization</Label>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
									{TOOLS.map((tool) => (
										<Button
											key={tool.value}
											type="button"
											variant={formData.tool_type === tool.value ? "default" : "outline"}
											className="h-auto p-4 flex flex-col items-center gap-2"
											onClick={() => updateFormData('tool_type', tool.value)}
										>
											<span className="text-lg">{tool.icon}</span>
											<span className="font-medium">{tool.label}</span>
											<span className="text-xs text-muted-foreground text-center">
												{tool.description}
											</span>
										</Button>
									))}
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-4">
									<div className="space-y-2">
										<Label>Camera Movement</Label>
										<Select
											value={formData.movement}
											onValueChange={(value) => updateFormData('movement', value)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select movement" />
											</SelectTrigger>
											<SelectContent>
												{MOVEMENT.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														<div className="flex flex-col">
															<span>{option.label}</span>
															<span className="text-xs text-muted-foreground">
																{option.description}
															</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label>Lighting</Label>
										<Select
											value={formData.lighting}
											onValueChange={(value) => updateFormData('lighting', value)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select lighting" />
											</SelectTrigger>
											<SelectContent>
												{LIGHTING.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														<div className="flex flex-col">
															<span>{option.label}</span>
															<span className="text-xs text-muted-foreground">
																{option.description}
															</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label>Camera Angle</Label>
										<Select
											value={formData.camera_angle}
											onValueChange={(value) => updateFormData('camera_angle', value)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select camera angle" />
											</SelectTrigger>
											<SelectContent>
												{CAMERA_ANGLES.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														<div className="flex flex-col">
															<span>{option.label}</span>
															<span className="text-xs text-muted-foreground">
																{option.description}
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
										<Label>Visual Style</Label>
										<Select
											value={formData.style}
											onValueChange={(value) => updateFormData('style', value)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select style" />
											</SelectTrigger>
											<SelectContent>
												{STYLES.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														<div className="flex flex-col">
															<span>{option.label}</span>
															<span className="text-xs text-muted-foreground">
																{option.description}
															</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label>Quality</Label>
										<Select
											value={formData.quality}
											onValueChange={(value) => updateFormData('quality', value)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select quality" />
											</SelectTrigger>
											<SelectContent>
												{QUALITY.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														<div className="flex flex-col">
															<span>{option.label}</span>
															<span className="text-xs text-muted-foreground">
																{option.description}
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
														{format.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="commercial" className="space-y-6">
							<div className="space-y-4">
								<Label>Commercial Template</Label>
								<Select
									value={formData.commercial_type || ""}
									onValueChange={(value) => updateFormData('commercial_type', value || undefined)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select commercial type" />
									</SelectTrigger>
									<SelectContent>
										{COMMERCIAL_TYPES.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												<div className="flex flex-col">
													<span>{option.label}</span>
													<span className="text-xs text-muted-foreground">
														{option.description}
													</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{formData.commercial_type && (
								<div className="space-y-2">
									<Label>Additional Context</Label>
									<Input
										placeholder="Product name, brand details, target audience, etc."
										value={formData.context_details || ""}
										onChange={(e) => updateFormData('context_details', e.target.value)}
									/>
								</div>
							)}

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>AI Tool</Label>
									<Select
										value={formData.tool_type}
										onValueChange={(value) => updateFormData('tool_type', value)}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select tool" />
										</SelectTrigger>
										<SelectContent>
											{TOOLS.map((tool) => (
												<SelectItem key={tool.value} value={tool.value}>
													{tool.icon} {tool.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label>Quality</Label>
									<Select
										value={formData.quality}
										onValueChange={(value) => updateFormData('quality', value)}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select quality" />
										</SelectTrigger>
										<SelectContent>
											{QUALITY.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</TabsContent>

						<Button
							type="submit"
							disabled={isLoading}
							className="w-full md:w-auto bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
						>
							{isLoading ? "Generating..." : "Generate Video Prompts"}
						</Button>
					</form>
				</Tabs>
			</CardContent>
		</Card>
	)
} 