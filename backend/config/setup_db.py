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
        schema_path = os.path.join(script_dir, 'schema.sql')
        
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        # Connect to the database and execute the schema
        conn = await asyncpg.connect(DATABASE_URL)
        print(f"✅ Connected to database")
        
        # Execute the SQL schema
        print(f"🔄 Creating database schema...")
        await conn.execute(schema_sql)
        print(f"✅ Database schema created successfully!")
        
        # Create initial subscription plans
        print(f"🔄 Creating initial subscription plans...")
        await create_subscription_plans(conn)
        print(f"✅ Initial subscription plans created!")
        
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error setting up database: {e}")
        return False

async def create_subscription_plans(conn):
    """Create initial subscription plans."""
    # Check if plans already exist
    plans_exist = await conn.fetchval("SELECT EXISTS(SELECT 1 FROM subscription_plans)")
    
    if plans_exist:
        print("✅ Subscription plans already exist, skipping creation")
        return
    
    # Define subscription plans
    plans = [
        {
            'name': 'Free',
            'price': 0.00,
            'billing_cycle': 'monthly',
            'features': {
                'daily_prompts': 5,
                'can_save': True,
                'templates': 'basic',
                'support': 'community'
            },
            'prompt_limit': 5
        },
        {
            'name': 'Pro',
            'price': 9.99,
            'billing_cycle': 'monthly',
            'features': {
                'daily_prompts': 50,
                'can_save': True,
                'templates': 'all',
                'support': 'email',
                'priority_processing': True
            },
            'prompt_limit': 50
        },
        {
            'name': 'Pro Annual',
            'price': 99.99,
            'billing_cycle': 'yearly',
            'features': {
                'daily_prompts': 50,
                'can_save': True,
                'templates': 'all',
                'support': 'email',
                'priority_processing': True
            },
            'prompt_limit': 50
        },
        {
            'name': 'Enterprise',
            'price': 49.99,
            'billing_cycle': 'monthly',
            'features': {
                'daily_prompts': 200,
                'can_save': True,
                'templates': 'all',
                'support': 'dedicated',
                'priority_processing': True,
                'api_access': True,
                'team_management': True
            },
            'prompt_limit': 200
        }
    ]
    
    # Insert plans into database
    for plan in plans:
        await conn.execute("""
            INSERT INTO subscription_plans 
            (name, price, billing_cycle, features, prompt_limit, is_active)
            VALUES ($1, $2, $3, $4, $5, true)
        """, plan['name'], plan['price'], plan['billing_cycle'], plan['features'], plan['prompt_limit'])

# Run the setup function
if __name__ == "__main__":
    asyncio.run(setup_database()) 