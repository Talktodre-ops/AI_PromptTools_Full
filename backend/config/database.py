import os
from supabase import create_client, Client
from pgvector.asyncpg import register_vector
import asyncpg
import redis
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = None

if supabase_url and supabase_key:
    supabase = create_client(supabase_url, supabase_key)
else:
    print("WARNING: Supabase environment variables not set!")

# Direct PostgreSQL connection for vector operations
async def get_db_connection():
    conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
    await register_vector(conn)
    return conn

# Redis connection for caching (optional)
redis_client = None
redis_host = os.getenv("REDIS_HOST")
redis_port = os.getenv("REDIS_PORT")

if redis_host and redis_port:
    try:
        redis_client = redis.Redis(
            host=redis_host,
            port=int(redis_port),
            db=0,
            decode_responses=True
        )
        print("✅ Redis connection established")
    except Exception as e:
        print(f"❌ Redis connection failed: {e}") 