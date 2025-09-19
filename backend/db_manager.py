#!/usr/bin/env python3
"""
Database Manager for PROMPTHERO
Commands to interact with your Supabase database from terminal
"""
import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

def get_client():
    """Get Supabase client."""
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

def show_users():
    """Show all users in the database."""
    supabase = get_client()
    try:
        response = supabase.table('users').select("*").execute()
        print(f"\n=== USERS ({len(response.data)}) ===")
        for user in response.data:
            print(f"ID: {user['id']}")
            print(f"Email: {user['email']}")
            print(f"Display Name: {user.get('display_name', 'N/A')}")
            print(f"Subscription: {user.get('subscription_tier', 'N/A')}")
            print(f"Created: {user['created_at'][:16]}")
            print(f"Last Login: {user.get('last_login', 'Never')[:16] if user.get('last_login') else 'Never'}")
            print(f"Usage: {user.get('usage_count', 0)}/{user.get('usage_quota', 'unlimited')}")
            print("-" * 50)
    except Exception as e:
        print(f"Error: {e}")

def show_prompts():
    """Show user prompts."""
    supabase = get_client()
    try:
        response = supabase.table('user_prompts').select("*, users(email)").execute()
        print(f"\n=== USER PROMPTS ({len(response.data)}) ===")
        for prompt in response.data:
            print(f"ID: {prompt['id']}")
            print(f"User: {prompt['users']['email'] if prompt.get('users') else 'Unknown'}")
            print(f"Mode: {prompt.get('mode', 'N/A')}")
            print(f"Tone: {prompt.get('tone', 'N/A')}")
            print(f"Input: {prompt.get('raw_input', '')[:100]}...")
            print(f"Quality Score: {prompt.get('quality_score', 'N/A')}")
            print(f"Favorite: {'Yes' if prompt.get('is_favorite') else 'No'}")
            print(f"Created: {prompt['created_at'][:16]}")
            print("-" * 50)
    except Exception as e:
        print(f"Error: {e}")

def show_analytics():
    """Show usage analytics."""
    supabase = get_client()
    try:
        response = supabase.table('usage_analytics').select("*, users(email)").execute()
        print(f"\n=== USAGE ANALYTICS ({len(response.data)}) ===")
        for record in response.data:
            print(f"Date: {record.get('date', 'N/A')}")
            print(f"User: {record['users']['email'] if record.get('users') else 'Unknown'}")
            print(f"Prompts Generated: {record.get('prompts_generated', 0)}")
            print(f"Tokens Used: {record.get('tokens_used', 0)}")
            print(f"API Calls: {record.get('api_calls', 0)}")
            print("-" * 50)
    except Exception as e:
        print(f"Error: {e}")

def add_sample_templates():
    """Add sample prompt templates."""
    supabase = get_client()

    templates = [
        {
            'title': 'Creative Writing Assistant',
            'category': 'writing',
            'description': 'Help improve creative writing with style and tone suggestions',
            'content': 'Improve this creative text for better flow and engagement: {input}',
            'variables': ['input'],
            'example_output': 'Enhanced creative writing with improved style and engagement',
            'is_premium': False
        },
        {
            'title': 'Video Script Generator',
            'category': 'video',
            'description': 'Generate compelling video scripts for various platforms',
            'content': 'Create a {duration} video script about {topic} for {platform}. Tone: {tone}',
            'variables': ['duration', 'topic', 'platform', 'tone'],
            'example_output': 'Professional video script with clear structure and engaging content',
            'is_premium': True
        },
        {
            'title': 'Code Documentation',
            'category': 'technical',
            'description': 'Generate clear documentation for code snippets',
            'content': 'Document this code clearly: {code}. Include purpose, parameters, and usage examples.',
            'variables': ['code'],
            'example_output': 'Clear code documentation with examples and explanations',
            'is_premium': False
        }
    ]

    try:
        for template in templates:
            response = supabase.table('prompt_templates').insert(template).execute()
            print(f"Added template: {template['title']}")
        print(f"\nAdded {len(templates)} sample templates!")
    except Exception as e:
        print(f"Error adding templates: {e}")

def show_activities():
    """Show recent user activities."""
    supabase = get_client()
    try:
        response = supabase.table('user_activities').select("*, users(email)").order('created_at', desc=True).limit(10).execute()
        print(f"\n=== RECENT ACTIVITIES ({len(response.data)}) ===")
        for activity in response.data:
            print(f"User: {activity['users']['email'] if activity.get('users') else 'Unknown'}")
            print(f"Activity: {activity.get('activity_type', 'N/A')}")
            print(f"Resource: {activity.get('resource_id', 'N/A')}")
            print(f"Time: {activity['created_at'][:16]}")
            if activity.get('metadata'):
                print(f"Metadata: {activity['metadata']}")
            print("-" * 50)
    except Exception as e:
        print(f"Error: {e}")

def main():
    """Main CLI interface."""
    if len(sys.argv) < 2:
        print("""
PROMPTHERO Database Manager

Available commands:
  users           - Show all users
  prompts         - Show user prompts
  analytics       - Show usage analytics
  activities      - Show recent activities
  add-templates   - Add sample prompt templates

Usage: python db_manager.py <command>
        """)
        return

    command = sys.argv[1].lower()

    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("ERROR: Supabase environment variables not set!")
        return

    print("Connecting to Supabase...")

    if command == 'users':
        show_users()
    elif command == 'prompts':
        show_prompts()
    elif command == 'analytics':
        show_analytics()
    elif command == 'activities':
        show_activities()
    elif command == 'add-templates':
        add_sample_templates()
    else:
        print(f"Unknown command: {command}")
        main()

if __name__ == "__main__":
    main()