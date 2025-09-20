#!/usr/bin/env python3
"""
Apply Gallery Schema Updates to Supabase Database
"""
import os
import asyncio
import asyncpg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def update_schema():
    """Apply the gallery schema updates."""
    if not DATABASE_URL:
        print("ERROR: DATABASE_URL not set. Please update .env file with:")
        print('DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.levanhhzepmrlriilqwi.supabase.co:5432/postgres')
        return False

    print("Connecting to database...")

    try:
        # Read the schema file
        script_dir = os.path.dirname(os.path.abspath(__file__))
        schema_path = os.path.join(script_dir, 'config', 'gallery_schema.sql')

        with open(schema_path, 'r') as f:
            schema_sql = f.read()

        # For now, we'll use the Supabase client approach instead
        # since DATABASE_URL needs password
        print("\nIMPORTANT: Schema updates need to be applied via Supabase dashboard")
        print("Steps to apply schema:")
        print("1. Go to your Supabase dashboard")
        print("2. Navigate to SQL Editor")
        print("3. Copy and paste the contents of config/gallery_schema.sql")
        print("4. Run the SQL commands")
        print("\nAlternatively, update DATABASE_URL in .env with your actual password")

        # Show what will be updated
        print("\n" + "="*60)
        print("SCHEMA UPDATES TO BE APPLIED:")
        print("="*60)
        print("1. Add new columns to prompt_templates:")
        print("   - difficulty_level, complexity_score, tags")
        print("   - platform_tags, use_cases, effectiveness_score")
        print("   - variations, examples, best_practices")
        print("   - And more AI-enhanced fields")
        print("\n2. Create new tables:")
        print("   - prompt_collections (curated sets)")
        print("   - prompt_reviews (user reviews)")
        print("   - prompt_versions (version history)")
        print("   - user_prompt_favorites")
        print("   - prompt_usage_tracking")
        print("\n3. Add indexes for performance")
        print("4. Create triggers for automatic updates")
        print("5. Insert sample collections")
        print("="*60)

        return True

    except Exception as e:
        print(f"Error: {e}")
        return False

async def verify_schema():
    """Verify if schema updates have been applied."""
    from supabase import create_client

    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

    supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

    print("\nVerifying schema updates...")

    # Check for new tables
    tables_to_check = [
        'prompt_collections',
        'prompt_reviews',
        'prompt_versions',
        'user_prompt_favorites',
        'prompt_usage_tracking'
    ]

    for table in tables_to_check:
        try:
            response = supabase.table(table).select("count", count="exact").execute()
            print(f"✓ Table '{table}' exists (count: {response.count})")
        except Exception as e:
            if "relation" in str(e).lower() and "does not exist" in str(e).lower():
                print(f"✗ Table '{table}' does not exist yet")
            else:
                print(f"? Error checking '{table}': {e}")

    # Check for new columns in prompt_templates
    try:
        response = supabase.table('prompt_templates').select("difficulty_level, complexity_score").limit(1).execute()
        print("✓ New columns in prompt_templates exist")
    except Exception as e:
        if "column" in str(e).lower():
            print("✗ New columns in prompt_templates not added yet")
        else:
            print(f"? Error checking columns: {e}")

if __name__ == "__main__":
    asyncio.run(update_schema())
    print("\n" + "="*60)
    asyncio.run(verify_schema())