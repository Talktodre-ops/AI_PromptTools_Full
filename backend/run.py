import uvicorn

if __name__ == "__main__":
    # Run the FastAPI application with the correct module path
    uvicorn.run("Backend.main:app", host="0.0.0.0", port=8000, reload=True) 