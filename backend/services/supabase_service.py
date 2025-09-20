import os
import hashlib
import json
from typing import Dict, List, Any, Optional
import asyncio
from datetime import datetime, date, timedelta

from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
supabase: Optional[Client] = None

if supabase_url and supabase_key:
    try:
        supabase = create_client(supabase_url, supabase_key)
    except Exception as e:
        print(f"❌ Error initializing Supabase client: {e}")

class SupabaseService:
    """Service for interacting with Supabase database."""
    
    @staticmethod
    def get_client() -> Optional[Client]:
        """Get the Supabase client."""
        return supabase
    
    @staticmethod
    async def save_prompt(user_id: str, raw_input: str, refined_prompts: List[str], 
                          mode: str, tone: str, persona: str = "", 
                          return_format: str = "plain") -> Dict[str, Any]:
        """Save a user prompt to the database."""
        if not supabase:
            raise Exception("Supabase client not initialized")
        
        # Convert refined prompts to JSON format
        refined_json = json.dumps(refined_prompts)
        
        # Generate a quality score based on the length and complexity
        quality_score = min(5.0, (len(refined_prompts) * 0.5 + len(raw_input) / 100))
        
        # Insert the prompt into the database
        result = supabase.table("user_prompts").insert({
            "user_id": user_id,
            "raw_input": raw_input,
            "refined_prompts": refined_json,
            "mode": mode,
            "tone": tone,
            "persona": persona,
            "return_format": return_format,
            "quality_score": quality_score,
            "is_favorite": False,
            "is_public": False
        }).execute()
        
        return result.data[0] if result.data else {}
    
    @staticmethod
    async def get_user_prompts(user_id: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Get user prompts from the database."""
        if not supabase:
            raise Exception("Supabase client not initialized")
        
        result = supabase.table("user_prompts")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .offset(offset)\
            .execute()
        
        return result.data if result.data else []
    
    @staticmethod
    async def toggle_favorite(prompt_id: str, user_id: str) -> Dict[str, Any]:
        """Toggle favorite status of a prompt."""
        if not supabase:
            raise Exception("Supabase client not initialized")
        
        # First, get the current favorite status
        result = supabase.table("user_prompts")\
            .select("is_favorite")\
            .eq("id", prompt_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not result.data:
            raise Exception("Prompt not found or not owned by this user")
        
        current_status = result.data[0].get("is_favorite", False)
        
        # Toggle the status
        update_result = supabase.table("user_prompts")\
            .update({"is_favorite": not current_status})\
            .eq("id", prompt_id)\
            .eq("user_id", user_id)\
            .execute()
        
        return update_result.data[0] if update_result.data else {}
    
    @staticmethod
    async def track_activity(user_id: str, activity_type: str, resource_id: Optional[str] = None, 
                            metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Track user activity."""
        if not supabase:
            raise Exception("Supabase client not initialized")
        
        result = supabase.table("user_activities").insert({
            "user_id": user_id,
            "activity_type": activity_type,
            "resource_id": resource_id,
            "metadata": json.dumps(metadata) if metadata else None
        }).execute()
        
        return result.data[0] if result.data else {}
    
    @staticmethod
    async def update_user_usage(user_id: str, prompts_generated: int = 1, 
                               tokens_used: int = 0) -> Dict[str, Any]:
        """Update user usage statistics."""
        if not supabase:
            raise Exception("Supabase client not initialized")
        
        today = date.today()
        
        # Check if we already have an entry for today
        result = supabase.table("usage_analytics")\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("date", today.isoformat())\
            .execute()
        
        if result.data:
            # Update existing entry
            existing = result.data[0]
            update_result = supabase.table("usage_analytics")\
                .update({
                    "prompts_generated": existing.get("prompts_generated", 0) + prompts_generated,
                    "tokens_used": existing.get("tokens_used", 0) + tokens_used,
                    "api_calls": existing.get("api_calls", 0) + 1
                })\
                .eq("id", existing.get("id"))\
                .execute()
            return update_result.data[0] if update_result.data else {}
        else:
            # Create new entry
            # First get user subscription tier
            user_result = supabase.table("users")\
                .select("subscription_tier")\
                .eq("id", user_id)\
                .execute()
            
            subscription_tier = user_result.data[0].get("subscription_tier", "free") if user_result.data else "free"
            
            # Create new usage entry
            insert_result = supabase.table("usage_analytics").insert({
                "user_id": user_id,
                "date": today.isoformat(),
                "prompts_generated": prompts_generated,
                "tokens_used": tokens_used,
                "api_calls": 1,
                "subscription_tier": subscription_tier
            }).execute()
            
            return insert_result.data[0] if insert_result.data else {} 