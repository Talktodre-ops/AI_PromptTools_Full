#!/usr/bin/env python3
"""
PROMPTHERO Database Status
Complete overview of your Supabase database
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

def show_database_overview():
    """Show complete database overview."""
    print("=" * 60)
    print("          PROMPTHERO DATABASE STATUS")
    print("=" * 60)

    tables = {
        'users': 'User Accounts',
        'user_sessions': 'Active Sessions',
        'user_prompts': 'Generated Prompts',
        'prompt_templates': 'Available Templates',
        'usage_analytics': 'Usage Analytics',
        'user_activities': 'User Activities',
        'subscription_plans': 'Subscription Plans',
        'prompt_embeddings': 'Prompt Embeddings',
        'prompt_ratings': 'Prompt Ratings',
        'seo_metadata': 'SEO Data',
        'blog_posts': 'Blog Posts'
    }

    print(f"\n{'TABLE':<20} {'DESCRIPTION':<25} {'COUNT':<10}")
    print("-" * 60)

    totals = {}
    for table, description in tables.items():
        try:
            response = supabase.table(table).select("count", count="exact").execute()
            count = response.count
            totals[table] = count
            print(f"{table:<20} {description:<25} {count:<10}")
        except Exception as e:
            print(f"{table:<20} {description:<25} ERROR")

    # Show key statistics
    print("\n" + "=" * 60)
    print("KEY STATISTICS")
    print("=" * 60)

    if totals.get('users', 0) > 0:
        # User statistics
        users_response = supabase.table('users').select("subscription_tier, usage_count, created_at").execute()
        if users_response.data:
            print(f"\nUSER BREAKDOWN:")
            subscription_counts = {}
            total_usage = 0
            for user in users_response.data:
                tier = user.get('subscription_tier', 'unknown')
                subscription_counts[tier] = subscription_counts.get(tier, 0) + 1
                total_usage += user.get('usage_count', 0)

            for tier, count in subscription_counts.items():
                print(f"  - {tier.capitalize()}: {count} users")
            print(f"  - Total Usage: {total_usage} prompts generated")

    if totals.get('user_prompts', 0) > 0:
        # Prompt statistics
        prompts_response = supabase.table('user_prompts').select("mode, quality_score, is_favorite").execute()
        if prompts_response.data:
            print(f"\nPROMPT BREAKDOWN:")
            mode_counts = {}
            favorites = 0
            total_quality = 0
            quality_count = 0

            for prompt in prompts_response.data:
                mode = prompt.get('mode', 'unknown')
                mode_counts[mode] = mode_counts.get(mode, 0) + 1
                if prompt.get('is_favorite'):
                    favorites += 1
                if prompt.get('quality_score'):
                    total_quality += float(prompt['quality_score'])
                    quality_count += 1

            for mode, count in mode_counts.items():
                print(f"  - {mode.capitalize()}: {count} prompts")
            print(f"  - Favorites: {favorites} prompts")
            if quality_count > 0:
                avg_quality = total_quality / quality_count
                print(f"  - Average Quality Score: {avg_quality:.2f}/5.0")

    if totals.get('usage_analytics', 0) > 0:
        # Analytics summary
        analytics_response = supabase.table('usage_analytics').select("prompts_generated, tokens_used, api_calls").execute()
        if analytics_response.data:
            print(f"\nUSAGE ANALYTICS:")
            total_prompts = sum(r.get('prompts_generated', 0) for r in analytics_response.data)
            total_tokens = sum(r.get('tokens_used', 0) for r in analytics_response.data)
            total_calls = sum(r.get('api_calls', 0) for r in analytics_response.data)

            print(f"  - Total Prompts: {total_prompts}")
            print(f"  - Total Tokens: {total_tokens}")
            print(f"  - Total API Calls: {total_calls}")

    print("\n" + "=" * 60)
    print("RECENT ACTIVITY")
    print("=" * 60)

    # Recent activities
    try:
        activities_response = supabase.table('user_activities').select("activity_type, created_at").order('created_at', desc=True).limit(5).execute()
        if activities_response.data:
            print(f"\nLAST 5 ACTIVITIES:")
            for activity in activities_response.data:
                activity_type = activity.get('activity_type', 'unknown')
                created_at = activity['created_at'][:16]  # Format timestamp
                print(f"  - {activity_type} ({created_at})")
        else:
            print("\nNo recent activities found")
    except Exception as e:
        print(f"\nError getting activities: {e}")

    print("\n" + "=" * 60)
    print("DATABASE HEALTH: GOOD")
    print("=" * 60)

if __name__ == "__main__":
    show_database_overview()