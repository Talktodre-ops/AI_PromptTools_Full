import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Check for required environment variables
required_vars = [
    "GEMINI_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "DATABASE_URL",
    "JWT_SECRET_KEY"
]
missing_vars = []

for var in required_vars:
    if not os.getenv(var):
        missing_vars.append(var)

if missing_vars:
    print("❌ ERROR: The following required environment variables are missing:")
    for var in missing_vars:
        print(f"  - {var}")
    print("\nPlease create a .env file in the backend directory with these variables.")
    print("Example .env file content:")
    print("GEMINI_API_KEY=your_gemini_api_key_here")
    print("SUPABASE_URL=your_supabase_url_here")
    print("SUPABASE_ANON_KEY=your_supabase_anon_key_here")
    print("DATABASE_URL=postgres://postgres:password@db.your-project-id.supabase.co:5432/postgres")
    print("JWT_SECRET_KEY=your_secret_key_for_jwt_tokens")
else:
    print("✅ All required environment variables are set!")
    print("You can run the backend server with: python run.py") 