"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { fetchFromApi, type PromptResponse, type PromptRequest, API_URL } from "@/lib/api"
import type { Prompt } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import { cleanPromptText } from "@/lib/utils"

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

interface Props {
  onResults: (results: Prompt[]) => void
}

export default function PromptForm({ onResults }: Props) {
	const [isLoading, setIsLoading] = useState(false)
	const { toast } = useToast()
	const [formData, setFormData] = useState<PromptRequest>({
		raw_input: "",
		mode: "deep",
		tone: "default",
		persona: "none",
		return_format: "plain",  // Changed from format to return_format
	})

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			// Check if input is empty
			if (!formData.raw_input.trim()) {
				throw new Error("Please enter your idea or request");
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

	return (
		<Card className="p-6">
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-2">
					<Label htmlFor="prompt-input">Your Idea or Request</Label>
					<Textarea
						key="prompt-input"
						id="prompt-input"
						placeholder="Enter your idea, question, or task here. Be as specific as possible."
						value={formData.raw_input}
						onChange={(e) => updateFormData('raw_input', e.target.value)}
						className="min-h-[200px] resize-y text-base"
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
							onValueChange={(value) => updateFormData('tone', value)}
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
							onValueChange={(value) => updateFormData('persona', value)}
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
