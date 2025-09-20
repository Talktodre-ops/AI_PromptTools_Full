"""
AI-Powered Prompt Enhancement Service
Uses Gemini API to analyze prompts and generate advanced features
"""
import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
import google.generativeai as genai
from dotenv import load_dotenv
import hashlib
import numpy as np

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class PromptEnhancer:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-pro')
        self.embedding_model = 'models/embedding-001'

    async def enhance_prompt(self, prompt_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enhance a prompt with AI-generated features and analysis.
        """
        enhanced = prompt_data.copy()

        try:
            # Generate variations
            variations = await self.generate_variations(
                prompt_data['title'],
                prompt_data['template_content']
            )
            enhanced['variations'] = variations

            # Generate examples
            examples = await self.generate_examples(
                prompt_data['title'],
                prompt_data['template_content']
            )
            enhanced['examples'] = examples

            # Generate best practices
            best_practices = await self.generate_best_practices(
                prompt_data['title'],
                prompt_data['template_content'],
                prompt_data['category']
            )
            enhanced['best_practices'] = best_practices

            # Calculate effectiveness score
            effectiveness = await self.calculate_effectiveness_score(
                prompt_data['template_content'],
                prompt_data['category']
            )
            enhanced['effectiveness_score'] = effectiveness

            # Generate semantic embedding (mock for now - would use actual embedding API)
            embedding = self.generate_mock_embedding(prompt_data['template_content'])
            enhanced['semantic_embedding'] = embedding

            # Platform-specific optimization
            platform_optimizations = await self.optimize_for_platforms(
                prompt_data['template_content']
            )
            enhanced['platform_optimizations'] = platform_optimizations

            # Industry-specific customization
            industry_customizations = await self.customize_for_industries(
                prompt_data['title'],
                prompt_data['template_content']
            )
            enhanced['industry_customizations'] = industry_customizations

            # Add metadata
            enhanced['enhanced_at'] = datetime.now().isoformat()
            enhanced['enhancement_version'] = '1.0'

        except Exception as e:
            print(f"Error enhancing prompt: {e}")
            enhanced['enhancement_error'] = str(e)

        return enhanced

    async def generate_variations(self, title: str, prompt: str) -> List[Dict[str, str]]:
        """Generate variations of the prompt for different use cases."""
        try:
            response = await asyncio.to_thread(
                self.model.generate_content,
                f"""Generate 3 variations of this prompt for different contexts.
                Original Title: {title}
                Original Prompt: {prompt}

                For each variation provide:
                1. A title
                2. The modified prompt
                3. The specific context or use case

                Format as JSON array with objects containing 'title', 'prompt', and 'context'.
                """
            )

            # Parse the response
            try:
                # Extract JSON from response
                text = response.text
                if '```json' in text:
                    text = text.split('```json')[1].split('```')[0]
                elif '```' in text:
                    text = text.split('```')[1].split('```')[0]

                variations = json.loads(text)
                return variations[:3]  # Limit to 3 variations
            except:
                # Fallback variations
                return [
                    {
                        "title": f"{title} - Professional",
                        "prompt": prompt + " Maintain a professional tone.",
                        "context": "Business and formal settings"
                    },
                    {
                        "title": f"{title} - Casual",
                        "prompt": prompt + " Use a friendly, conversational tone.",
                        "context": "Informal and creative contexts"
                    },
                    {
                        "title": f"{title} - Educational",
                        "prompt": prompt + " Explain concepts clearly for learning.",
                        "context": "Teaching and training scenarios"
                    }
                ]

        except Exception as e:
            print(f"Error generating variations: {e}")
            return []

    async def generate_examples(self, title: str, prompt: str) -> List[Dict[str, str]]:
        """Generate example inputs and outputs for the prompt."""
        try:
            response = await asyncio.to_thread(
                self.model.generate_content,
                f"""Create 2 practical examples of using this prompt.
                Title: {title}
                Prompt: {prompt}

                For each example provide:
                1. A sample user input
                2. Expected AI response snippet (brief)
                3. Use case scenario

                Format as JSON array with 'input', 'output', and 'scenario'.
                Keep outputs brief (50 words max).
                """
            )

            try:
                text = response.text
                if '```json' in text:
                    text = text.split('```json')[1].split('```')[0]
                elif '```' in text:
                    text = text.split('```')[1].split('```')[0]

                examples = json.loads(text)
                return examples[:2]
            except:
                # Fallback examples
                return [
                    {
                        "input": "Help me with this task",
                        "output": f"As {title}, I'll assist you with...",
                        "scenario": "General assistance request"
                    },
                    {
                        "input": "Can you explain this concept?",
                        "output": f"In my role as {title}, let me explain...",
                        "scenario": "Educational explanation"
                    }
                ]

        except Exception as e:
            print(f"Error generating examples: {e}")
            return []

    async def generate_best_practices(self, title: str, prompt: str, category: str) -> str:
        """Generate best practices for using this prompt effectively."""
        try:
            response = await asyncio.to_thread(
                self.model.generate_content,
                f"""Write 3-5 concise best practices for using this prompt effectively.
                Title: {title}
                Category: {category}
                Prompt: {prompt[:200]}...

                Focus on:
                - How to get the best results
                - Common pitfalls to avoid
                - Tips for customization

                Keep it brief and practical (max 150 words).
                """
            )

            return response.text[:500]  # Limit length

        except Exception as e:
            print(f"Error generating best practices: {e}")
            return f"Use this {category} prompt by providing clear, specific inputs. Customize the tone and style as needed."

    async def calculate_effectiveness_score(self, prompt: str, category: str) -> float:
        """Calculate an effectiveness score for the prompt (0-100)."""
        try:
            response = await asyncio.to_thread(
                self.model.generate_content,
                f"""Analyze this prompt's effectiveness on a scale of 0-100.
                Category: {category}
                Prompt: {prompt[:300]}...

                Consider:
                - Clarity of instructions (0-25 points)
                - Versatility and adaptability (0-25 points)
                - Specificity and detail (0-25 points)
                - Practical usefulness (0-25 points)

                Return only a number between 0 and 100.
                """
            )

            try:
                score = float(response.text.strip().replace('%', ''))
                return min(100, max(0, score))  # Ensure 0-100 range
            except:
                # Calculate basic score based on prompt characteristics
                base_score = 50
                if len(prompt) > 100:
                    base_score += 10
                if len(prompt) > 300:
                    base_score += 10
                if any(word in prompt.lower() for word in ['specific', 'detailed', 'comprehensive']):
                    base_score += 10
                if category in ['technical', 'professional']:
                    base_score += 10

                return min(90, base_score)

        except Exception as e:
            print(f"Error calculating effectiveness: {e}")
            return 70.0  # Default moderate score

    def generate_mock_embedding(self, text: str) -> List[float]:
        """Generate a mock embedding vector (placeholder for real embedding API)."""
        # In production, use actual embedding API
        # This is a deterministic mock based on text hash
        hash_obj = hashlib.md5(text.encode())
        hash_hex = hash_obj.hexdigest()

        # Convert to consistent float values
        embedding = []
        for i in range(0, min(32, len(hash_hex)), 2):
            value = int(hash_hex[i:i+2], 16) / 255.0
            embedding.append(value)

        # Pad to standard size (e.g., 384 dimensions)
        while len(embedding) < 384:
            embedding.append(0.0)

        return embedding[:384]

    async def optimize_for_platforms(self, prompt: str) -> Dict[str, str]:
        """Optimize prompt for different AI platforms."""
        optimizations = {
            "chatgpt": prompt,
            "claude": prompt + "\n\nPlease provide a comprehensive and well-structured response.",
            "gemini": prompt + "\n\nConsider multiple perspectives and provide detailed insights.",
            "gpt4": prompt + "\n\nUse your advanced capabilities to provide nuanced analysis."
        }

        return optimizations

    async def customize_for_industries(self, title: str, prompt: str) -> Dict[str, str]:
        """Customize prompt for different industries."""
        industries = {
            "technology": "Focus on technical accuracy and innovation.",
            "healthcare": "Ensure medical accuracy and patient safety considerations.",
            "finance": "Include financial best practices and regulatory compliance.",
            "education": "Emphasize pedagogical approaches and learning outcomes.",
            "marketing": "Focus on ROI, engagement metrics, and brand voice.",
            "legal": "Ensure legal accuracy and jurisdictional considerations."
        }

        customizations = {}
        for industry, focus in industries.items():
            customizations[industry] = f"{prompt}\n\nIndustry focus: {focus}"

        return customizations

    async def batch_enhance(self, prompts: List[Dict[str, Any]], batch_size: int = 5) -> List[Dict[str, Any]]:
        """Enhance multiple prompts in batches."""
        enhanced_prompts = []

        for i in range(0, len(prompts), batch_size):
            batch = prompts[i:i + batch_size]
            batch_tasks = [self.enhance_prompt(p) for p in batch]

            # Process batch concurrently
            batch_results = await asyncio.gather(*batch_tasks)
            enhanced_prompts.extend(batch_results)

            print(f"Enhanced {min(i + batch_size, len(prompts))}/{len(prompts)} prompts...")

            # Small delay to avoid rate limiting
            await asyncio.sleep(1)

        return enhanced_prompts

# Utility function for testing
async def test_enhancer():
    """Test the prompt enhancer with a sample prompt."""
    enhancer = PromptEnhancer()

    sample_prompt = {
        'title': 'Act as a Python Developer',
        'template_content': 'I want you to act as a Python developer. I will provide you with code snippets or programming challenges, and you will respond with solutions, explanations, and best practices.',
        'category': 'technical'
    }

    enhanced = await enhancer.enhance_prompt(sample_prompt)

    print(json.dumps(enhanced, indent=2, default=str))

if __name__ == "__main__":
    asyncio.run(test_enhancer())