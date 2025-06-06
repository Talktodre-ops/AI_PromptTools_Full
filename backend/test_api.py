import requests
import time
import json

# Configuration
BASE_URL = "http://localhost:8000"  # Change this to your actual API URL
TIMEOUT = 10  # seconds

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

if __name__ == "__main__":
    print("Testing API endpoints...")
    health_ok = test_health()
    
    if health_ok:
        refine_ok = test_refine()
        
        if refine_ok:
            print("\n✅ All tests passed!")
        else:
            print("\n❌ Refine endpoint test failed")
    else:
        print("\n❌ Health endpoint test failed") 