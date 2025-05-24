from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import refine, explain

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(refine.router)
app.include_router(explain.router)