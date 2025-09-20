# Supabase Database Setup for PromptHero

This document provides instructions for setting up and connecting to the Supabase database for the PromptHero application.

## Prerequisites

1. A Supabase account (create one at [supabase.com](https://supabase.com) if you don't have one)
2. A Supabase project created for PromptHero
3. Python 3.9+ installed on your system

## Setup Process

### 1. Get Your Supabase Credentials

After creating your Supabase project, you'll need the following credentials:

- **SUPABASE_URL**: Found in Project Settings → API → URL
- **SUPABASE_ANON_KEY**: Found in Project Settings → API → Project API keys → anon/public
- **DATABASE_URL**: Found in Project Settings → Database → Connection string → URI format

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgres://postgres:password@db.your-project-id.supabase.co:5432/postgres
JWT_SECRET_KEY=your_secret_key_for_jwt_tokens

# Server Configuration
PORT=8000
```

Replace the placeholder values with your actual credentials.

### 3. Install Required Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Run the Database Setup Script

This script will create all the necessary tables and initial data in your Supabase project:

```bash
cd backend
python setup_database.py
```

### 5. Verify the Setup

You can check if everything is set up correctly by running the backend server:

```bash
python run.py
```

Then visit `http://localhost:8000/health` in your browser. You should see a JSON response with status "healthy" and the Supabase connection shown as "connected".

## Database Schema

The database includes the following tables:

1. **users**: User accounts and authentication information
2. **user_sessions**: Active user sessions
3. **prompt_templates**: Reusable prompt templates
4. **user_prompts**: User-generated prompts
5. **prompt_ratings**: User ratings for prompts and templates
6. **prompt_embeddings**: Vector embeddings for similarity search
7. **user_activities**: User activity tracking
8. **usage_analytics**: User usage statistics
9. **subscription_plans**: Available subscription plans
10. **user_subscriptions**: User subscription information

For detailed schema information, see the `backend/config/schema.sql` file.

## API Endpoints

### Authentication Endpoints

- **POST /register**: Register a new user
- **POST /token**: Log in and get an access token
- **GET /me**: Get current user information

### Prompt Endpoints

- **POST /refine**: Generate refined prompts
- **GET /prompts**: Get user's saved prompts
- **POST /prompts/{prompt_id}/favorite**: Toggle favorite status of a prompt

### Video Prompt Endpoints

- **POST /video**: Generate video prompts
- **POST /video/quick**: Generate quick video prompts using templates
- **GET /video/templates**: Get available video templates

### Analytics Endpoints

- **GET /analytics/usage**: Get usage statistics
- **GET /analytics/activities**: Get activity history
- **GET /analytics/summary**: Get user summary statistics

## Using the Database in the Application

The application now automatically stores all user data in the Supabase database, including:

1. User accounts and authentication
2. Generated prompts and explanations
3. User activity and usage statistics

All API endpoints now require authentication with a valid JWT token, which is provided upon login.

## Real-time Features

Supabase supports real-time updates through subscriptions. To implement real-time features in the frontend:

```javascript
// Example subscription to user's prompt updates
const promptsSubscription = supabase
  .from('user_prompts')
  .on('*', (payload) => {
    console.log('Prompt change received!', payload);
    // Update UI accordingly
  })
  .subscribe();
```

## Troubleshooting

1. **Connection Issues**: Ensure your Supabase URL and API keys are correct
2. **Database Errors**: Check the Supabase dashboard for error logs
3. **Missing Tables**: Run `setup_database.py` again to ensure all tables are created
4. **Authentication Problems**: Make sure JWT_SECRET_KEY is set in your .env file 