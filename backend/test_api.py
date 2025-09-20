import requests
import time
import json
import unittest
from fastapi.testclient import TestClient
import os
from unittest.mock import patch, MagicMock
from Backend.main import app

# Configuration
BASE_URL = "http://localhost:8000"  # Change this to your actual API URL
TIMEOUT = 10  # seconds

client = TestClient(app)

# Mock environment variables for testing
os.environ["GEMINI_API_KEY"] = "fake_api_key_for_testing"

def test_health():
    """Test the health endpoint"""
    try:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/", timeout=TIMEOUT)
        elapsed = time.time() - start_time
        
        print(f"Health check: {response.status_code} in {elapsed:.2f}s")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {str(e)}")
        return False

def test_refine():
    """Test the refine endpoint with a simple prompt"""
    try:
        payload = {
            "raw_input": "Write a short email",
            "mode": "basic",  # Using basic mode for faster response
            "tone": "professional",
            "persona": "none",
            "return_format": "plain"
        }
        
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/refine", 
            json=payload,
            timeout=TIMEOUT
        )
        elapsed = time.time() - start_time
        
        print(f"Refine test: {response.status_code} in {elapsed:.2f}s")
        if response.status_code == 200:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"Error: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Refine test failed: {str(e)}")
        return False

class TestAPI(unittest.TestCase):
    
    def test_root(self):
        response = client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "API is running")
        
    def test_health_check(self):
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["services"]["gemini_api"], "connected")
    
    @patch('services.gemini_service.GEMINI_MODEL')
    def test_refine_prompt(self, mock_model):
        # Setup mock
        mock_response = MagicMock()
        mock_response.text = "This is a refined prompt"
        mock_model.generate_content_async.return_value = mock_response
        
        # Test data
        test_data = {
            "raw_input": "test prompt",
            "mode": "basic",
            "tone": "default",
            "persona": "",
            "return_format": "plain"
        }
        
        # Make request
        response = client.post("/refine", json=test_data)
        
        # Check response
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("refined_prompts", data)
        self.assertIsInstance(data["refined_prompts"], list)
    
    @patch('services.gemini_service.GEMINI_MODEL')
    def test_explain_prompt(self, mock_model):
        # Setup mock
        mock_response = MagicMock()
        mock_response.text = "This is an explanation"
        mock_model.generate_content_async.return_value = mock_response
        
        # Test data
        test_data = {
            "prompt": "test prompt"
        }
        
        # Make request
        response = client.post("/explain", json=test_data)
        
        # Check response
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("explanation", data)
        self.assertIsInstance(data["explanation"], str)
    
    @patch('services.gemini_service.GEMINI_MODEL')
    def test_video_prompt(self, mock_model):
        # Setup mock
        mock_response = MagicMock()
        mock_response.text = "This is a video prompt"
        mock_model.generate_content_async.return_value = mock_response
        
        # Test data
        test_data = {
            "raw_input": "a drone flying over a forest",
            "camera_angle": "aerial",
            "lighting": "golden-hour",
            "movement": "tracking",
            "style": "cinematic",
            "tone": "dramatic",
            "return_format": "plain"
        }
        
        # Make request
        response = client.post("/video", json=test_data)
        
        # Check response
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("refined_prompts", data)
        self.assertIsInstance(data["refined_prompts"], list)
        
if __name__ == "__main__":
    unittest.main() 