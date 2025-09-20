import os
import asyncio
import asyncpg
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL")

async def setup_database():
    """Set up the database schema."""
    if not DATABASE_URL:
        print("❌ DATABASE_URL environment variable not set!")
        return False
    
    print(f"🔄 Connecting to database...")
    
    try:
        # Read the schema file
        script_dir = os.path.dirname(os.path.abspath(__file__))
        schema_path = os.path.join(script_dir, 'schema_new.sql')
        
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        # Connect to the database and execute the schema
        conn = await asyncpg.connect(DATABASE_URL)
        print(f"✅ Connected to database")
        
        # Execute the SQL schema
        print(f"🔄 Creating database schema...")
        await conn.execute(schema_sql)
        print(f"✅ Database schema created successfully!")
        
        # Create initial data
        print(f"🔄 Creating initial data...")
        await create_initial_data(conn)
        print(f"✅ Initial data created!")
        
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error setting up database: {e}")
        return False

async def create_initial_data(conn):
    """Create initial data like prompt templates."""
    # Check if templates already exist
    templates_exist = await conn.fetchval("SELECT EXISTS(SELECT 1 FROM prompt_templates)")

    if templates_exist:
        print("✅ Initial templates already exist, skipping creation")
        return

    # Define initial prompt templates
    templates = [
        {
            'name': 'Basic Writing Assistant',
            'category': 'writing',
            'description': 'General purpose writing improvement',
            'template_content': 'Please improve the following text for clarity and engagement: {input_text}',
            'variables': ['input_text'],
            'example_output': 'Enhanced version with better flow and clarity'
        },
        {
            'name': 'Video Prompt - Cinematic',
            'category': 'video',
            'description': 'Create cinematic video prompts',
            'template_content': 'Create a cinematic video of: {scene_description}. Style: {visual_style}. Camera: {camera_movement}',
            'variables': ['scene_description', 'visual_style', 'camera_movement'],
            'example_output': 'Professional video generation prompt'
        },
        {
            'name': 'Code Explanation',
            'category': 'code',
            'description': 'Explain code functionality',
            'template_content': 'Explain this code in simple terms: {code_snippet}. Focus on what it does and how it works.',
            'variables': ['code_snippet'],
            'example_output': 'Clear explanation of code functionality'
        }
    ]

    # Insert templates into database
    for template in templates:
        await conn.execute("""
            INSERT INTO prompt_templates
            (name, category, description, template_content, variables, example_output, is_active, usage_count)
            VALUES ($1, $2, $3, $4, $5, $6, true, 0)
        """, template['name'], template['category'], template['description'],
             template['template_content'], template['variables'], template['example_output'])

# Run the setup function
if __name__ == "__main__":
    asyncio.run(setup_database()) 