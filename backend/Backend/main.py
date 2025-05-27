from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

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