from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
from pathlib import Path

# Add the parent directory to sys.path to allow imports from sibling directories
sys.path.append(str(Path(__file__).parent.parent))
from routers import refine, explain

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # For local development
        "https://ai-prompt-tools-full.vercel.app"  # Your production URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(refine.router)
app.include_router(explain.router)

# Add a root endpoint for API health check
@app.get("/")
async def root():
    return {"status": "API is running"}