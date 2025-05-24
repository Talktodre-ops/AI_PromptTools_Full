// This is a mock API route for demonstration purposes
// In a real implementation, this would call your FastAPI backend

import { NextResponse } from "next/server"

// Mock data for demonstration
const mockPrompts = {
  quick: [
    {
      id: "1",
      prompt:
        "Write a persuasive article about climate change that highlights the urgent need for action while providing practical steps individuals can take.",
      explanation:
        "This prompt is direct and focused on a specific output (persuasive article) with a clear topic (climate change) and additional parameters (urgency + practical steps).",
    },
  ],
  deep: [
    {
      id: "1",
      prompt:
        "Write a persuasive article about climate change that addresses the following aspects:\n\n1. The scientific consensus on human-caused climate change\n2. The most significant current and projected impacts\n3. Why immediate action is necessary\n4. 5-7 practical steps individuals can take to reduce their carbon footprint\n5. How these individual actions connect to broader systemic change\n\nUse a tone that creates urgency without inducing despair, and include credible data points to support your arguments.",
      explanation:
        "This prompt breaks down the request into specific components, provides clear structure, and gives guidance on tone and content requirements.",
    },
    {
      id: "2",
      prompt:
        "Create a persuasive climate change article that balances emotional appeal with factual evidence. Include sections on current impacts, future projections, and actionable solutions. Target an educated general audience with moderate climate knowledge.",
      explanation:
        "This prompt focuses on balancing emotional and factual elements while specifying the target audience and their knowledge level.",
    },
  ],
  "few-shot": [
    {
      id: "1",
      prompt:
        'Write a persuasive article about climate change. Here are some examples of effective persuasive writing:\n\nExample 1: "The rising sea levels aren\'t just statistics—they\'re the future reality for coastal communities like Miami and New Orleans. By 2050, these iconic American cities could face regular flooding that displaces thousands."\n\nExample 2: "While governments debate policies, individuals can make immediate impact. Reducing meat consumption by just one day per week can save 348 pounds of carbon emissions annually—equivalent to driving 348 miles less."\n\nNow, write a complete persuasive article that creates urgency around climate action while offering practical solutions.',
      explanation:
        "This prompt provides concrete examples of the writing style and approach desired, helping to guide the model toward similar output.",
    },
  ],
  cot: [
    {
      id: "1",
      prompt:
        "I need to write a persuasive article about climate change. Let's think through this step by step:\n\n1. First, I need to establish why climate change matters to my audience. What immediate and long-term threats does it pose to their lives?\n\n2. Next, I should address common objections or hesitations about taking action. What barriers prevent people from acting on climate change?\n\n3. Then, I need to present evidence that is both scientifically accurate and emotionally compelling. What data points and stories would be most effective?\n\n4. Finally, I should provide specific, actionable steps that feel achievable rather than overwhelming. What actions have the highest impact-to-effort ratio?\n\nBased on this thinking process, write a persuasive article about climate change that creates urgency while offering practical solutions.",
      explanation:
        "This prompt walks through a reasoning process, breaking down the approach to writing the article before requesting the final output.",
    },
  ],
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mode } = body

    // In a real implementation, this would call your FastAPI backend
    // For now, we'll use mock data based on the mode
    const prompts = mockPrompts[mode as keyof typeof mockPrompts] || []

    return NextResponse.json({ prompts })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate prompt" }, { status: 500 })
  }
}
