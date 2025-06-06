import os
import multiprocessing

# Get the number of CPU cores for optimal worker count
# Use min(2 * cpu_count + 1, 4) as a good default for most applications
# But cap at 4 workers for free/basic tier services
cpu_count = multiprocessing.cpu_count()
worker_count = min(2 * cpu_count + 1, 4)

if __name__ == "__main__":
    # Check if we're running locally or in production
    is_production = os.environ.get("RENDER", False) or os.environ.get("PRODUCTION", False)
    
    if is_production:
        # In production, use Gunicorn with multiple workers
        import gunicorn.app.base
        
        class StandaloneApplication(gunicorn.app.base.BaseApplication):
            def __init__(self, app, options=None):
                self.options = options or {}
                self.application = app
                super().__init__()
                
            def load_config(self):
                for key, value in self.options.items():
                    if key in self.cfg.settings and value is not None:
                        self.cfg.set(key.lower(), value)
                        
            def load(self):
                return self.application
        
        # Import the FastAPI app
        from Backend.main import app
        
        # Configure Gunicorn
        port = int(os.environ.get("PORT", 8000))
        options = {
            "bind": f"0.0.0.0:{port}",
            "workers": worker_count,
            "worker_class": "uvicorn.workers.UvicornWorker",
            "accesslog": "-",  # Log to stdout
            "errorlog": "-",   # Log to stderr
            "timeout": 120,    # Increase timeout for LLM calls
            "preload_app": True,
        }
        
        print(f"Starting server with {worker_count} workers on port {port}")
        StandaloneApplication(app, options).run()
    else:
        # For local development, use Uvicorn with reload
        import uvicorn
        uvicorn.run("Backend.main:app", host="0.0.0.0", port=8000, reload=True) 