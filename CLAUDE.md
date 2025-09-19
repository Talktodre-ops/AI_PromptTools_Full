# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PROMPTHERO is a full-stack application for AI prompt engineering with a Next.js frontend and FastAPI backend. It helps users create, refine, and optimize prompts for various AI models and use cases, including text generation and video generation.

## Commands

### Backend (FastAPI)
```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run backend server (development)
cd backend
python run.py

# Alternative: Run with uvicorn directly
cd backend
uvicorn Backend.main:app --reload

# Run backend in production mode
cd backend
PRODUCTION=true python run.py

# Check environment variables
cd backend
python check_env.py

# Setup Supabase database tables
cd backend
python setup_database.py

# Run API tests
cd backend
python test_api.py

# Load testing with Locust
cd backend
locust -f locustfile.py --host=http://localhost:8000
```

### Frontend (Next.js)
```bash
# Install dependencies
cd frontend
npm install

# Run development server
cd frontend
npm run dev

# Build for production
cd frontend
npm run build

# Start production server
cd frontend
npm start

# Run linter
cd frontend
npm run lint
```

### Quick Start Scripts
```bash
# Windows: Start both servers
./start.bat

# Linux/Mac: Start both servers
./start.sh
```

## Architecture

### Backend Structure
The backend is a FastAPI application with modular router structure:

- **Main Entry**: `backend/Backend/main.py` - FastAPI app initialization with middleware for CORS, rate limiting, and error handling
- **Server Runner**: `backend/run.py` - Production/development server launcher with Gunicorn support
- **Routers** (`backend/routers/`):
  - `refine.py` - Prompt refinement endpoints
  - `explain.py` - Prompt explanation endpoints
  - `video.py` - Video prompt generation
  - `image.py` - Image-to-prompt conversion
  - `users.py` - User authentication and management
  - `analytics.py` - Usage analytics and statistics
- **Services** (`backend/services/`):
  - `supabase_service.py` - Database connection and operations
  - Google Gemini AI integration for prompt generation
- **Configuration**: Environment variables via `.env` file

### Frontend Structure
Next.js 15 application with TypeScript and Tailwind CSS:

- **App Directory**: `frontend/app/` - Next.js app router pages
- **Components**: `frontend/components/` - Reusable React components using shadcn/ui
- **Libraries**: `frontend/lib/` - Utility functions and API clients
- **State Management**: Zustand for client-side state
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom animations via Framer Motion

### Database Architecture
Supabase PostgreSQL database with the following key tables:
- `users` - User accounts and authentication
- `user_sessions` - Active sessions management
- `user_prompts` - Saved prompts with embeddings
- `prompt_templates` - Reusable templates
- `usage_analytics` - User activity tracking

### Key Features Implementation
1. **Prompt Engineering Modes**: Basic, Quick, Deep, Few-shot, Chain-of-thought
2. **Video Prompt Generation**: Templates for Runway, Pika, Sora
3. **Image-to-Prompt**: Convert images to detailed prompts
4. **Authentication**: JWT-based with Supabase
5. **Rate Limiting**: 50 requests per minute per IP
6. **Real-time Updates**: Supabase subscriptions for live data

## Environment Variables

### Backend (.env)
```
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgres://...
JWT_SECRET_KEY=your_jwt_secret
PORT=8000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Endpoints

- **Health**: `GET /` and `GET /health`
- **Auth**: `POST /register`, `POST /token`, `GET /me`
- **Prompts**: `POST /refine`, `POST /explain`, `GET /prompts`
- **Video**: `POST /video`, `POST /video/quick`, `GET /video/templates`
- **Image**: `POST /image-to-prompt`
- **Analytics**: `GET /analytics/usage`, `GET /analytics/activities`

## Development Workflow

1. Backend runs on port 8000, frontend on port 3000
2. CORS is configured to allow all origins in development
3. Hot-reload enabled for both backend (uvicorn) and frontend (Next.js)
4. Supabase provides real-time database updates
5. Rate limiting active even in development (50 req/min)

## Important Notes

- Always ensure environment variables are set before running
- Database setup required via `setup_database.py` for first run
- Frontend uses server actions and API routes for backend communication
- Authentication required for most API endpoints (JWT tokens)
- File uploads handled through FormData with Pillow for image processing