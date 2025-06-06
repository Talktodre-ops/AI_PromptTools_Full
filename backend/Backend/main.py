from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import os
import sys
import time
import traceback
from pathlib import Path
import asyncio
from collections import defaultdict

# Add the parent directory to sys.path to allow imports from sibling directories
sys.path.append(str(Path(__file__).parent.parent))
from routers import refine, explain

app = FastAPI(
    title="Prompt Engineering API",
    description="API for generating and refining AI prompts",
    version="1.0.0",
)

# Add CORS middleware with more permissive settings for testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple rate limiter
class RateLimiter:
    def __init__(self, rate_limit=10, time_window=60):
        self.rate_limit = rate_limit  # Max requests per time window
        self.time_window = time_window  # Time window in seconds
        self.request_counts = defaultdict(list)  # IP -> list of request timestamps
    
    def is_rate_limited(self, client_ip):
        # Clean up old requests
        current_time = time.time()
        self.request_counts[client_ip] = [
            timestamp for timestamp in self.request_counts[client_ip] 
            if current_time - timestamp < self.time_window
        ]
        
        # Check if rate limited
        if len(self.request_counts[client_ip]) >= self.rate_limit:
            return True
        
        # Record this request
        self.request_counts[client_ip].append(current_time)
        return False

# Create rate limiter instance (50 requests per minute instead of 10)
rate_limiter = RateLimiter(rate_limit=50, time_window=60)

# Add rate limiter middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    
    # Skip rate limiting for health check endpoints
    if request.url.path in ["/", "/health"]:
        return await call_next(request)
    
    # Check if rate limited
    if rate_limiter.is_rate_limited(client_ip):
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Please try again later."}
        )
    
    return await call_next(request)

# Add request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        print(f"Request to {request.url.path} took {process_time:.2f} seconds")
        return response
    except Exception as e:
        process_time = time.time() - start_time
        print(f"Error in request to {request.url.path} after {process_time:.2f} seconds: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Internal server error: {str(e)}"}
        )

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global exception: {str(exc)}")
    print(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

# Validation error handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )

# Include routers
app.include_router(refine.router)
app.include_router(explain.router)

# Add a root endpoint for API health check
@app.get("/")
async def root():
    return {"status": "API is running", "version": "1.0.0"}

# Add a health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "gemini_api": "connected" if os.getenv("GEMINI_API_KEY") else "not configured"
        }
    }