#!/usr/bin/env python3
"""
Test Gallery Import and Enhancement Pipeline
Tests the complete workflow from data import to API endpoints
"""
import os
import sys
import asyncio
import json
from datetime import datetime
import requests
from dotenv import load_dotenv
from supabase import create_client

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from import_prompts import PromptImporter
from services.prompt_enhancer import PromptEnhancer

load_dotenv()

class GalleryPipelineTester:
    def __init__(self):
        self.supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_ANON_KEY")
        )
        self.api_base_url = "http://localhost:8000"
        self.test_results = {}

    def print_section(self, title):
        """Print a formatted section header."""
        print("\n" + "="*60)
        print(f" {title}")
        print("="*60)

    def test_database_schema(self):
        """Test if the database schema has been updated."""
        self.print_section("TESTING DATABASE SCHEMA")

        tests = {
            "prompt_templates_exists": False,
            "new_columns_exist": False,
            "collections_table": False,
            "reviews_table": False,
            "favorites_table": False
        }

        try:
            # Test prompt_templates exists
            response = self.supabase.table('prompt_templates').select("count", count="exact").execute()
            tests["prompt_templates_exists"] = True
            print(f"OK prompt_templates table exists ({response.count} records)")

            # Test new columns
            response = self.supabase.table('prompt_templates').select("difficulty_level, tags, platform_tags").limit(1).execute()
            tests["new_columns_exist"] = True
            print("✓ New columns exist in prompt_templates")

        except Exception as e:
            print(f"✗ Error testing prompt_templates: {e}")

        # Test other tables
        table_tests = [
            ("prompt_collections", "collections_table"),
            ("prompt_reviews", "reviews_table"),
            ("user_prompt_favorites", "favorites_table")
        ]

        for table_name, test_key in table_tests:
            try:
                response = self.supabase.table(table_name).select("count", count="exact").execute()
                tests[test_key] = True
                print(f"✓ {table_name} table exists ({response.count} records)")
            except Exception as e:
                print(f"✗ {table_name} table missing: {e}")

        self.test_results["database_schema"] = tests
        return all(tests.values())

    def test_data_import(self, limit=5):
        """Test the data import functionality."""
        self.print_section("TESTING DATA IMPORT")

        try:
            importer = PromptImporter()

            # Download prompts
            print("Downloading sample prompts...")
            df = importer.download_prompts()

            if df is None:
                print("✗ Failed to download prompts")
                return False

            print(f"✓ Downloaded {len(df)} prompts")

            # Process a few samples
            print(f"Processing {limit} sample prompts...")
            processed_prompts = []

            for index, row in df.head(limit).iterrows():
                prompt_record = importer.prepare_prompt_for_db(row, index)
                processed_prompts.append(prompt_record)

            print(f"✓ Processed {len(processed_prompts)} prompts")

            # Show sample
            if processed_prompts:
                sample = processed_prompts[0]
                print(f"\nSample processed prompt:")
                print(f"  Title: {sample['title']}")
                print(f"  Category: {sample['category']}")
                print(f"  Difficulty: {sample['difficulty_level']}")
                print(f"  Keywords: {', '.join(sample['tags'][:3])}")

            self.test_results["data_import"] = {
                "download_success": True,
                "processing_success": True,
                "sample_count": len(processed_prompts)
            }

            return True

        except Exception as e:
            print(f"✗ Import test failed: {e}")
            self.test_results["data_import"] = {"error": str(e)}
            return False

    async def test_ai_enhancement(self):
        """Test the AI enhancement service."""
        self.print_section("TESTING AI ENHANCEMENT")

        try:
            enhancer = PromptEnhancer()

            # Test prompt
            sample_prompt = {
                'title': 'Act as a Python Developer',
                'template_content': 'I want you to act as a Python developer. Help me write clean, efficient Python code and follow best practices.',
                'category': 'technical',
                'mode': 'deep',
                'tone': 'professional',
                'persona': 'python developer'
            }

            print("Testing AI enhancement on sample prompt...")

            # Test individual enhancement functions
            variations = await enhancer.generate_variations(
                sample_prompt['title'],
                sample_prompt['template_content']
            )
            print(f"✓ Generated {len(variations)} variations")

            examples = await enhancer.generate_examples(
                sample_prompt['title'],
                sample_prompt['template_content']
            )
            print(f"✓ Generated {len(examples)} examples")

            effectiveness = await enhancer.calculate_effectiveness_score(
                sample_prompt['template_content'],
                sample_prompt['category']
            )
            print(f"✓ Calculated effectiveness score: {effectiveness}/100")

            best_practices = await enhancer.generate_best_practices(
                sample_prompt['title'],
                sample_prompt['template_content'],
                sample_prompt['category']
            )
            print(f"✓ Generated best practices ({len(best_practices)} chars)")

            # Test full enhancement
            enhanced = await enhancer.enhance_prompt(sample_prompt)
            print("✓ Full enhancement completed")

            self.test_results["ai_enhancement"] = {
                "variations_count": len(variations),
                "examples_count": len(examples),
                "effectiveness_score": effectiveness,
                "enhancement_success": True
            }

            return True

        except Exception as e:
            print(f"✗ AI enhancement test failed: {e}")
            self.test_results["ai_enhancement"] = {"error": str(e)}
            return False

    def test_api_endpoints(self):
        """Test the gallery API endpoints."""
        self.print_section("TESTING API ENDPOINTS")

        tests = {}
        base_url = self.api_base_url

        # Test endpoints
        endpoints_to_test = [
            ("GET", "/gallery/prompts", "browse_prompts"),
            ("GET", "/gallery/collections", "get_collections"),
            ("GET", "/gallery/stats", "get_stats"),
            ("GET", "/gallery/categories", "get_categories"),
            ("GET", "/gallery/platforms", "get_platforms"),
            ("GET", "/gallery/search/suggestions?query=python", "search_suggestions")
        ]

        for method, endpoint, test_name in endpoints_to_test:
            try:
                if method == "GET":
                    response = requests.get(f"{base_url}{endpoint}", timeout=10)

                if response.status_code == 200:
                    data = response.json()
                    tests[test_name] = True
                    print(f"✓ {endpoint} - Success")

                    # Show sample data
                    if endpoint == "/gallery/prompts" and "prompts" in data:
                        print(f"  Found {len(data['prompts'])} prompts")
                    elif endpoint == "/gallery/collections" and "collections" in data:
                        print(f"  Found {len(data['collections'])} collections")

                else:
                    tests[test_name] = False
                    print(f"✗ {endpoint} - Failed ({response.status_code})")

            except requests.exceptions.ConnectionError:
                tests[test_name] = False
                print(f"✗ {endpoint} - Connection failed (server not running?)")
            except Exception as e:
                tests[test_name] = False
                print(f"✗ {endpoint} - Error: {e}")

        self.test_results["api_endpoints"] = tests
        return any(tests.values())

    def test_database_operations(self):
        """Test basic database operations."""
        self.print_section("TESTING DATABASE OPERATIONS")

        tests = {}

        try:
            # Test reading existing data
            prompts = self.supabase.table('prompt_templates').select("*").limit(5).execute()
            tests["read_prompts"] = len(prompts.data) > 0
            print(f"✓ Read {len(prompts.data)} prompts from database")

            # Test collections
            collections = self.supabase.table('prompt_collections').select("*").execute()
            tests["read_collections"] = len(collections.data) > 0
            print(f"✓ Read {len(collections.data)} collections from database")

            # Test creating a test record (and then delete it)
            test_prompt = {
                'title': 'Test Prompt - DELETE ME',
                'description': 'Test description',
                'category': 'test',
                'template_content': 'This is a test prompt',
                'mode': 'quick',
                'tone': 'casual',
                'persona': 'tester',
                'original_source': 'test_pipeline'
            }

            create_response = self.supabase.table('prompt_templates').insert(test_prompt).execute()
            if create_response.data:
                test_id = create_response.data[0]['id']
                tests["create_prompt"] = True
                print("✓ Created test prompt")

                # Delete the test prompt
                self.supabase.table('prompt_templates').delete().eq('id', test_id).execute()
                tests["delete_prompt"] = True
                print("✓ Deleted test prompt")
            else:
                tests["create_prompt"] = False
                print("✗ Failed to create test prompt")

        except Exception as e:
            print(f"✗ Database operations failed: {e}")
            tests["error"] = str(e)

        self.test_results["database_operations"] = tests
        return tests.get("read_prompts", False)

    def generate_report(self):
        """Generate a comprehensive test report."""
        self.print_section("TEST REPORT")

        total_tests = 0
        passed_tests = 0

        for section, results in self.test_results.items():
            print(f"\n{section.upper()}:")

            if isinstance(results, dict):
                for test_name, result in results.items():
                    if test_name == "error":
                        continue

                    total_tests += 1
                    if result:
                        passed_tests += 1
                        print(f"  ✓ {test_name}")
                    else:
                        print(f"  ✗ {test_name}")

                if "error" in results:
                    print(f"  Error: {results['error']}")

        print(f"\nOVERALL RESULTS:")
        print(f"  Passed: {passed_tests}/{total_tests}")
        print(f"  Success Rate: {(passed_tests/total_tests)*100:.1f}%")

        # Recommendations
        print(f"\nRECOMMENDATIONS:")
        if not self.test_results.get("database_schema", {}).get("new_columns_exist", False):
            print("  - Run: python update_gallery_schema.py")
            print("  - Or apply gallery_schema.sql in Supabase dashboard")

        if not any(self.test_results.get("api_endpoints", {}).values()):
            print("  - Start the API server: python run.py")

        if "ai_enhancement" in self.test_results and "error" in self.test_results["ai_enhancement"]:
            print("  - Check GEMINI_API_KEY in .env file")

        print(f"\nREADY FOR PRODUCTION:")
        production_ready = (
            self.test_results.get("database_schema", {}).get("new_columns_exist", False) and
            any(self.test_results.get("api_endpoints", {}).values()) and
            self.test_results.get("database_operations", {}).get("read_prompts", False)
        )
        print(f"  {'✓ YES' if production_ready else '✗ NO'}")

        return production_ready

    async def run_all_tests(self):
        """Run all tests in sequence."""
        print("PROMPTHERO GALLERY PIPELINE TESTER")
        print("Testing complete import and enhancement workflow...")

        # Run tests
        self.test_database_schema()
        self.test_data_import(limit=3)  # Test with just 3 prompts
        await self.test_ai_enhancement()
        self.test_api_endpoints()
        self.test_database_operations()

        # Generate report
        return self.generate_report()

async def main():
    """Main test runner."""
    tester = GalleryPipelineTester()
    success = await tester.run_all_tests()

    if success:
        print("\n🎉 Gallery pipeline is ready!")
        print("You can now:")
        print("1. Run full import: python import_prompts.py")
        print("2. Start the API: python run.py")
        print("3. Access gallery at: http://localhost:3000/marketplace")
    else:
        print("\n⚠️  Some tests failed. Check the recommendations above.")

    return success

if __name__ == "__main__":
    asyncio.run(main())