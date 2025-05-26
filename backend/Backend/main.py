from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import refine, explain
from dotenv import load_dotenv
import os

load_dotenv

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("CORS_ORIGIN", "http://localhost:3000"),  # Default to localhost if not set
        "https://your-production-domain.com",  # Add your production domain here
    ],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(refine.router)
app.include_router(explain.router)