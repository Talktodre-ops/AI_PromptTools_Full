#!/usr/bin/env python3
"""
Database Setup Script for PromptHero
------------------------------------
This script sets up the Supabase database schema for the PromptHero application.
"""

import os
import sys
from pathlib import Path
import asyncio

# Add the parent directory to sys.path to allow imports
sys.path.append(str(Path(__file__).parent))

# Import the setup function
from config.setup_db import setup_database

# Check if .env file exists
env_path = Path(__file__).parent / '.env'
if not env_path.exists():
    print("❌ .env file not found in the backend directory!")
    print("Please create a .env file with the following variables:")
    print("SUPABASE_URL=your_supabase_url_here")
    print("SUPABASE_ANON_KEY=your_supabase_anon_key_here")
    print("DATABASE_URL=postgres://postgres:password@db.your-supabase-project.supabase.co:5432/postgres")
    sys.exit(1)

async def main():
    """Run the database setup process."""
    print("🚀 Setting up the PromptHero database...")
    success = await setup_database()
    
    if success:
        print("\n✅ Database setup completed successfully!")
        print("You can now start the backend with: python run.py")
    else:
        print("\n❌ Database setup failed. Please check the error messages above.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 