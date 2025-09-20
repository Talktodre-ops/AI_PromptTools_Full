#!/usr/bin/env python3
"""
Simple Gallery Pipeline Test
Basic tests without Unicode characters for Windows compatibility
"""
import os
import sys
import asyncio
import requests
from dotenv import load_dotenv
from supabase import create_client

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

async def test_basic_functionality():
    """Test basic gallery functionality."""
    print("=" * 60)
    print("BASIC GALLERY FUNCTIONALITY TEST")
    print("=" * 60)

    # Test database connection
    print("\n1. Testing database connection...")
    try:
        supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_ANON_KEY")
        )

        # Test existing tables
        response = supabase.table('prompt_templates').select("count", count="exact").execute()
        print(f"   OK - prompt_templates exists ({response.count} records)")

        # Test if new columns exist
        try:
            response = supabase.table('prompt_templates').select("difficulty_level, tags").limit(1).execute()
            print("   OK - New gallery columns exist")
            schema_ready = True
        except:
            print("   WARNING - New gallery columns not found")
            schema_ready = False

    except Exception as e:
        print(f"   ERROR - Database connection failed: {e}")
        return False

    # Test API endpoints
    print("\n2. Testing API endpoints...")
    api_url = "http://localhost:8000"

    endpoints = [
        "/gallery/prompts",
        "/gallery/collections",
        "/gallery/categories",
        "/gallery/platforms"
    ]

    api_working = False
    for endpoint in endpoints:
        try:
            response = requests.get(f"{api_url}{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"   OK - {endpoint}")
                api_working = True
            else:
                print(f"   ERROR - {endpoint} returned {response.status_code}")
        except requests.exceptions.ConnectionError:
            print(f"   ERROR - {endpoint} connection failed (server not running?)")
        except Exception as e:
            print(f"   ERROR - {endpoint} failed: {e}")

    # Test data import capability
    print("\n3. Testing data import...")
    try:
        import pandas as pd
        df = pd.read_csv("https://huggingface.co/datasets/fka/awesome-chatgpt-prompts/resolve/main/prompts.csv")
        print(f"   OK - Can download {len(df)} prompts from Hugging Face")
        import_ready = True
    except Exception as e:
        print(f"   ERROR - Cannot download prompts: {e}")
        import_ready = False

    # Test AI enhancement
    print("\n4. Testing AI enhancement...")
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel('gemini-pro')
        print("   OK - Gemini API configured")
        ai_ready = True
    except Exception as e:
        print(f"   ERROR - Gemini API not working: {e}")
        ai_ready = False

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Database Connection: {'OK' if schema_ready else 'NEEDS SETUP'}")
    print(f"API Endpoints: {'OK' if api_working else 'START SERVER'}")
    print(f"Data Import: {'OK' if import_ready else 'CHECK INTERNET'}")
    print(f"AI Enhancement: {'OK' if ai_ready else 'CHECK GEMINI_API_KEY'}")

    overall_ready = schema_ready and (api_working or import_ready)
    print(f"\nGallery Ready: {'YES' if overall_ready else 'NO'}")

    if not overall_ready:
        print("\nNext Steps:")
        if not schema_ready:
            print("1. Apply database schema: run gallery_schema.sql in Supabase")
        if not api_working:
            print("2. Start API server: python run.py")
        if not import_ready:
            print("3. Check internet connection")
        if not ai_ready:
            print("4. Set GEMINI_API_KEY in .env file")

    return overall_ready

if __name__ == "__main__":
    asyncio.run(test_basic_functionality())