from locust import HttpUser, task, between
import logging
import json
import time
import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PromptUser(HttpUser):
    # Increase wait time to 3-8 seconds between tasks for more realistic user behavior
    wait_time = between(3, 8)  
    
    def on_start(self):
        """Called when a user starts before any task is scheduled"""
        logger.info("New user started")
    
    def handle_response(self, response, name):
        """Handle and log response details"""
        if response.status_code != 200:
            logger.error(f"Request to {name} failed with status {response.status_code}")
            logger.error(f"Response: {response.text}")
            response.failure(f"Got status code {response.status_code}")
        else:
            logger.info(f"Request to {name} succeeded with status {response.status_code}")
            # Log a snippet of the response to avoid overwhelming logs
            try:
                response_data = response.json()
                logger.info(f"Response preview: {json.dumps(response_data)[:100]}...")
            except:
                logger.info(f"Response (not JSON): {response.text[:100]}...")
    
    def make_request_with_retry(self, method, endpoint, payload=None, max_retries=2):
        """Make a request with retry logic"""
        for attempt in range(max_retries + 1):
            try:
                if method == "get":
                    with self.client.get(endpoint, catch_response=True) as response:
                        self.handle_response(response, endpoint)
                        return response
                elif method == "post":
                    with self.client.post(endpoint, json=payload, catch_response=True) as response:
                        self.handle_response(response, endpoint)
                        return response
            except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
                if attempt < max_retries:
                    logger.warning(f"Connection error on attempt {attempt+1}/{max_retries+1}. Retrying...")
                    time.sleep(1)  # Wait 1 second before retrying
                else:
                    logger.error(f"Request to {endpoint} failed after {max_retries+1} attempts: {str(e)}")
                    # Create a dummy response to mark as failure
                    with self.client.get("/", catch_response=True) as response:
                        response.status_code = 0
                        response.failure(f"Connection error after {max_retries+1} attempts: {str(e)}")
                        return response

    @task(2)  # Reduced weight for refine tasks
    def refine_prompt(self):
        self.make_request_with_retry(
            "post",
            "/refine", 
            {
                "raw_input": "Email about project update",  # Shorter prompt
                "mode": "basic",  # Using basic mode for faster responses
                "tone": "professional",
                "persona": "none",
                "return_format": "plain"
            }
        )
    
    @task(1)  # Same weight for explain task
    def explain_prompt(self):
        self.make_request_with_retry(
            "post",
            "/explain", 
            {
                "prompt": "Follow up email"  # Shorter prompt
            }
        )
    
    @task(3)  # Increased weight for health checks
    def check_health(self):
        self.make_request_with_retry("get", "/")
    
    @task(2)  # Increased weight for health endpoint
    def check_health_endpoint(self):
        self.make_request_with_retry("get", "/health")

# To run this test:
# 1. Install locust: pip install locust
# 2. Run: locust -f locustfile.py
# 3. Open http://localhost:8089 in your browser
# 4. Set the number of users and spawn rate, then start the test

# For a quick command-line test with 30 users:
# locust -f locustfile.py --headless -u 30 -r 5 --host=http://localhost:8000 --run-time 1m 