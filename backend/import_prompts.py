#!/usr/bin/env python3
"""
Prompt Gallery Import Script
Downloads prompts from Hugging Face awesome-chatgpt-prompts dataset
and imports them into our Supabase database with enhanced features.
"""
import os
import csv
import json
import requests
from datetime import datetime
from typing import List, Dict, Any
from dotenv import load_dotenv
from supabase import create_client
import pandas as pd

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# Hugging Face dataset URL
HF_DATASET_URL = "https://huggingface.co/datasets/fka/awesome-chatgpt-prompts/resolve/main/prompts.csv"

class PromptImporter:
    def __init__(self):
        self.supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        self.prompts_data = []

    def download_prompts(self):
        """Download prompts from Hugging Face."""
        print("Downloading prompts from Hugging Face...")
        try:
            response = requests.get(HF_DATASET_URL)
            response.raise_for_status()

            # Save to temporary file
            with open('temp_prompts.csv', 'wb') as f:
                f.write(response.content)

            # Read CSV
            df = pd.read_csv('temp_prompts.csv')
            print(f"Downloaded {len(df)} prompts successfully!")

            # Clean up temp file
            os.remove('temp_prompts.csv')

            return df

        except Exception as e:
            print(f"Error downloading prompts: {e}")
            # Try alternative method using pandas directly
            try:
                df = pd.read_csv(HF_DATASET_URL)
                print(f"Downloaded {len(df)} prompts successfully (direct method)!")
                return df
            except Exception as e2:
                print(f"Alternative download also failed: {e2}")
                return None

    def categorize_prompt(self, act: str, prompt: str) -> Dict[str, Any]:
        """Categorize and enhance a prompt based on its content."""
        act_lower = act.lower()
        prompt_lower = prompt.lower()

        # Determine category
        category = "general"
        if any(word in act_lower for word in ['developer', 'programmer', 'engineer', 'terminal', 'sql', 'code']):
            category = "technical"
        elif any(word in act_lower for word in ['writer', 'poet', 'author', 'journalist', 'storyteller']):
            category = "writing"
        elif any(word in act_lower for word in ['marketer', 'advertiser', 'seo', 'sales', 'business']):
            category = "marketing"
        elif any(word in act_lower for word in ['teacher', 'tutor', 'educator', 'instructor', 'academic']):
            category = "education"
        elif any(word in act_lower for word in ['coach', 'motivator', 'therapist', 'counselor', 'advisor']):
            category = "coaching"
        elif any(word in act_lower for word in ['designer', 'artist', 'creative', 'musician', 'composer']):
            category = "creative"
        elif any(word in act_lower for word in ['doctor', 'nurse', 'health', 'medical', 'fitness']):
            category = "health"
        elif any(word in act_lower for word in ['lawyer', 'legal', 'attorney', 'law']):
            category = "legal"
        elif any(word in act_lower for word in ['chef', 'cook', 'recipe', 'food', 'restaurant']):
            category = "food"
        elif any(word in act_lower for word in ['travel', 'guide', 'tourism']):
            category = "travel"

        # Determine difficulty level
        difficulty = "intermediate"
        if len(prompt) < 200:
            difficulty = "beginner"
        elif len(prompt) > 500:
            difficulty = "advanced"

        # Extract keywords
        keywords = []
        important_words = act.split() + [w for w in prompt.split()[:20] if len(w) > 4]
        keywords = list(set([w.lower().strip('.,!?";') for w in important_words if len(w) > 3]))[:10]

        # Determine mode
        mode = "deep"
        if "quick" in prompt_lower or "brief" in prompt_lower:
            mode = "quick"
        elif "creative" in act_lower or "story" in act_lower:
            mode = "creative"

        # Calculate complexity score (0-100)
        complexity_score = min(100, len(prompt) / 10 + len(keywords) * 2)

        return {
            "category": category,
            "difficulty": difficulty,
            "keywords": keywords,
            "mode": mode,
            "complexity_score": complexity_score,
            "platform_tags": ["ChatGPT", "Claude", "Gemini"],  # Works with all
            "use_cases": self.generate_use_cases(act, category)
        }

    def generate_use_cases(self, act: str, category: str) -> List[str]:
        """Generate practical use cases for a prompt."""
        use_cases = []

        use_case_map = {
            "technical": ["Software development", "Code review", "Debugging", "Documentation"],
            "writing": ["Content creation", "Blog posts", "Creative writing", "Editing"],
            "marketing": ["Ad copy", "Social media", "Email campaigns", "Brand strategy"],
            "education": ["Learning assistance", "Course creation", "Study guides", "Tutoring"],
            "coaching": ["Personal development", "Career guidance", "Motivation", "Goal setting"],
            "creative": ["Design concepts", "Art direction", "Music composition", "Creative brainstorming"],
            "health": ["Health advice", "Fitness planning", "Nutrition guidance", "Wellness tips"],
            "legal": ["Legal research", "Contract review", "Legal advice", "Compliance"],
            "food": ["Recipe creation", "Menu planning", "Cooking tips", "Restaurant recommendations"],
            "travel": ["Trip planning", "Travel recommendations", "Itinerary creation", "Local insights"],
            "general": ["General assistance", "Problem solving", "Information research", "Task automation"]
        }

        return use_case_map.get(category, use_case_map["general"])

    def prepare_prompt_for_db(self, row: pd.Series, index: int) -> Dict[str, Any]:
        """Prepare a single prompt for database insertion."""
        act = row.get('act', '')
        prompt_text = row.get('prompt', '')

        # Get enhanced features
        features = self.categorize_prompt(act, prompt_text)

        # Create the database record
        prompt_record = {
            'title': act,
            'description': f"AI assistant acting as {act}",
            'category': features['category'],
            'template_content': prompt_text,
            'mode': features['mode'],
            'tone': 'professional',  # Default tone
            'persona': act.lower().replace('act as ', '').replace('act as a ', '').replace('act as an ', ''),
            'variables': [],  # Extract variables from prompt if any
            'example_output': f"AI will respond as {act} based on your input",
            'is_premium': features['complexity_score'] > 70,  # Premium for complex prompts
            'usage_count': 0,
            'rating': 0.0,
            'rating_count': 0,
            'tags': features['keywords'],
            'difficulty_level': features['difficulty'],
            'complexity_score': features['complexity_score'],
            'platform_tags': features['platform_tags'],
            'use_cases': features['use_cases'],
            'original_source': 'awesome-chatgpt-prompts',
            'is_active': True,
            'created_by': 'system',
            'import_batch': f"import_{datetime.now().strftime('%Y%m%d')}",
            'import_index': index
        }

        return prompt_record

    def import_to_database(self, prompts: List[Dict[str, Any]]):
        """Import processed prompts to Supabase database."""
        print(f"\nImporting {len(prompts)} prompts to database...")

        success_count = 0
        error_count = 0

        for i, prompt in enumerate(prompts):
            try:
                # Check if prompt already exists
                existing = self.supabase.table('prompt_templates').select("id").eq('title', prompt['title']).execute()

                if existing.data:
                    print(f"  Skipping duplicate: {prompt['title']}")
                    continue

                # Insert new prompt
                response = self.supabase.table('prompt_templates').insert(prompt).execute()
                success_count += 1

                if (i + 1) % 10 == 0:
                    print(f"  Progress: {i + 1}/{len(prompts)} prompts processed...")

            except Exception as e:
                error_count += 1
                print(f"  Error inserting prompt '{prompt['title']}': {e}")

        print(f"\nImport completed!")
        print(f"  Success: {success_count} prompts")
        print(f"  Errors: {error_count} prompts")
        print(f"  Skipped: {len(prompts) - success_count - error_count} duplicates")

        return success_count, error_count

    def run(self):
        """Main import process."""
        print("=" * 60)
        print("PROMPT GALLERY IMPORT TOOL")
        print("=" * 60)

        # Download prompts
        df = self.download_prompts()
        if df is None:
            print("Failed to download prompts. Exiting.")
            return

        print(f"\nProcessing {len(df)} prompts...")

        # Process each prompt
        processed_prompts = []
        for index, row in df.iterrows():
            prompt_record = self.prepare_prompt_for_db(row, index)
            processed_prompts.append(prompt_record)

        print(f"Processed {len(processed_prompts)} prompts with enhanced features")

        # Show sample
        if processed_prompts:
            print("\nSample processed prompt:")
            sample = processed_prompts[0]
            print(f"  Title: {sample['title']}")
            print(f"  Category: {sample['category']}")
            print(f"  Difficulty: {sample['difficulty_level']}")
            print(f"  Complexity: {sample['complexity_score']:.1f}/100")
            print(f"  Keywords: {', '.join(sample['tags'][:5])}")

        # Ask for confirmation
        print("\n" + "=" * 60)
        response = input("Proceed with database import? (yes/no): ")

        if response.lower() in ['yes', 'y']:
            success, errors = self.import_to_database(processed_prompts)
            print(f"\nImport summary: {success} successful, {errors} failed")
        else:
            print("Import cancelled.")

        print("\n" + "=" * 60)
        print("IMPORT PROCESS COMPLETED")
        print("=" * 60)

if __name__ == "__main__":
    importer = PromptImporter()
    importer.run()