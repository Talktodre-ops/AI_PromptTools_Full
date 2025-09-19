#!/usr/bin/env python3
"""
PROMPTHERO Database Tools
Comprehensive database management for your Supabase database
"""
import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

def backup_user_data(email):
    """Backup all data for a specific user."""
    try:
        print(f"Backing up data for: {email}")

        # Get user ID
        user_response = supabase.table('users').select("id, email").eq('email', email).execute()
        if not user_response.data:
            print(f"User not found: {email}")
            return

        user_id = user_response.data[0]['id']

        # Get user prompts
        prompts = supabase.table('user_prompts').select("*").eq('user_id', user_id).execute()

        # Get user activities
        activities = supabase.table('user_activities').select("*").eq('user_id', user_id).execute()

        # Get analytics
        analytics = supabase.table('usage_analytics').select("*").eq('user_id', user_id).execute()

        backup_data = {
            'user': user_response.data[0],
            'prompts': prompts.data,
            'activities': activities.data,
            'analytics': analytics.data,
            'backup_date': datetime.now().isoformat()
        }

        filename = f"backup_{email.replace('@', '_').replace('.', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        import json
        with open(filename, 'w') as f:
            json.dump(backup_data, f, indent=2, default=str)

        print(f"Backup saved to: {filename}")
        print(f"  - {len(backup_data['prompts'])} prompts")
        print(f"  - {len(backup_data['activities'])} activities")
        print(f"  - {len(backup_data['analytics'])} analytics records")

    except Exception as e:
        print(f"Backup failed: {e}")

def cleanup_old_sessions():
    """Remove expired sessions."""
    try:
        # Delete sessions older than 30 days
        cutoff_date = (datetime.now() - timedelta(days=30)).isoformat()

        expired_sessions = supabase.table('user_sessions').select("count", count="exact").lt('expires_at', cutoff_date).execute()

        if expired_sessions.count > 0:
            supabase.table('user_sessions').delete().lt('expires_at', cutoff_date).execute()
            print(f"Cleaned up {expired_sessions.count} expired sessions")
        else:
            print("No expired sessions to clean up")

    except Exception as e:
        print(f"Session cleanup failed: {e}")

def update_template_usage(template_id):
    """Increment usage count for a template."""
    try:
        # Get current usage count
        template = supabase.table('prompt_templates').select("usage_count").eq('id', template_id).execute()

        if template.data:
            current_count = template.data[0].get('usage_count', 0)
            new_count = current_count + 1

            supabase.table('prompt_templates').update({'usage_count': new_count}).eq('id', template_id).execute()
            print(f"Updated template usage count to {new_count}")
        else:
            print(f"Template not found: {template_id}")

    except Exception as e:
        print(f"Failed to update template usage: {e}")

def generate_analytics_report():
    """Generate a comprehensive analytics report."""
    try:
        print("\n" + "="*50)
        print("PROMPTHERO ANALYTICS REPORT")
        print("="*50)

        # User growth
        users = supabase.table('users').select("created_at, subscription_tier").execute()
        if users.data:
            from collections import defaultdict
            monthly_signups = defaultdict(int)
            tier_counts = defaultdict(int)

            for user in users.data:
                month = user['created_at'][:7]  # YYYY-MM
                monthly_signups[month] += 1
                tier_counts[user.get('subscription_tier', 'free')] += 1

            print(f"\nUSER GROWTH:")
            for month, count in sorted(monthly_signups.items()):
                print(f"  {month}: {count} new users")

            print(f"\nSUBSCRIPTION BREAKDOWN:")
            for tier, count in tier_counts.items():
                print(f"  {tier}: {count} users")

        # Top templates
        templates = supabase.table('prompt_templates').select("title, usage_count").order('usage_count', desc=True).limit(5).execute()
        if templates.data:
            print(f"\nTOP TEMPLATES:")
            for template in templates.data:
                print(f"  {template['title']}: {template.get('usage_count', 0)} uses")

        # Recent activity summary
        activities = supabase.table('user_activities').select("activity_type").execute()
        if activities.data:
            activity_counts = defaultdict(int)
            for activity in activities.data:
                activity_counts[activity['activity_type']] += 1

            print(f"\nACTIVITY BREAKDOWN:")
            for activity_type, count in sorted(activity_counts.items(), key=lambda x: x[1], reverse=True):
                print(f"  {activity_type}: {count}")

        print("\n" + "="*50)

    except Exception as e:
        print(f"Report generation failed: {e}")

def add_blog_post(title, slug, content, category="general"):
    """Add a blog post to the database."""
    try:
        blog_post = {
            'title': title,
            'slug': slug,
            'content': content,
            'category': category,
            'excerpt': content[:200] + "..." if len(content) > 200 else content,
            'author_id': None,  # You can set this to a specific user ID if needed
            'is_published': True,
            'view_count': 0
        }

        response = supabase.table('blog_posts').insert(blog_post).execute()
        print(f"Blog post added: {title}")
        print(f"Slug: {slug}")

    except Exception as e:
        print(f"Failed to add blog post: {e}")

def main():
    """Main CLI interface."""
    if len(sys.argv) < 2:
        print("""
PROMPTHERO Database Tools

Available commands:
  status              - Show database status
  backup <email>      - Backup user data
  cleanup-sessions    - Remove expired sessions
  analytics           - Generate analytics report
  add-blog <title> <slug> <content> [category]  - Add blog post
  update-template <template_id>  - Increment template usage

Usage: python db_tools.py <command> [args...]
        """)
        return

    command = sys.argv[1].lower()

    if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_ANON_KEY"):
        print("ERROR: Supabase environment variables not set!")
        return

    if command == 'status':
        os.system('python db_status.py')
    elif command == 'backup':
        if len(sys.argv) < 3:
            print("Usage: python db_tools.py backup <email>")
        else:
            backup_user_data(sys.argv[2])
    elif command == 'cleanup-sessions':
        cleanup_old_sessions()
    elif command == 'analytics':
        generate_analytics_report()
    elif command == 'add-blog':
        if len(sys.argv) < 5:
            print("Usage: python db_tools.py add-blog <title> <slug> <content> [category]")
        else:
            category = sys.argv[5] if len(sys.argv) > 5 else "general"
            add_blog_post(sys.argv[2], sys.argv[3], sys.argv[4], category)
    elif command == 'update-template':
        if len(sys.argv) < 3:
            print("Usage: python db_tools.py update-template <template_id>")
        else:
            update_template_usage(sys.argv[2])
    else:
        print(f"Unknown command: {command}")
        main()

if __name__ == "__main__":
    main()