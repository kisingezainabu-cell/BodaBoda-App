#!/usr/bin/env python3
"""
BodaBoda API Test Suite
Automated testing for CI/CD pipeline
"""

import requests
import json
import time
import sys

class BodaBodaAPITester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/health", timeout=10)
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert "version" in data
            assert "database" in data
            print("✅ Health check passed")
            return True
        except Exception as e:
            print(f"❌ Health check failed: {e}")
            return False
    
    def test_user_registration(self):
        """Test user registration"""
        try:
            user_data = {
                "username": "testuser_ci",
                "email": "test@bodaboda.com",
                "password": "testpass123",
                "full_name": "Test User CI",
                "phone_number": "+255123456789",
                "user_type": "rider"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/register",
                json=user_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "user_id" in data
            assert "token" in data
            print("✅ User registration passed")
            return True
        except Exception as e:
            print(f"❌ User registration failed: {e}")
            return False
    
    def test_user_login(self):
        """Test user login"""
        try:
            login_data = {
                "email": "test@bodaboda.com",
                "password": "testpass123"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "user" in data
            assert "token" in data
            print("✅ User login passed")
            return True
        except Exception as e:
            print(f"❌ User login failed: {e}")
            return False
    
    def test_nearby_drivers(self):
        """Test nearby drivers endpoint"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/drivers/nearby?lat=-6.8&lng=39.2",
                timeout=10
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "drivers" in data
            assert len(data["drivers"]) > 0
            print("✅ Nearby drivers test passed")
            return True
        except Exception as e:
            print(f"❌ Nearby drivers test failed: {e}")
            return False
    
    def test_ride_request(self):
        """Test ride request endpoint"""
        try:
            ride_data = {
                "rider_id": 1,
                "pickup_latitude": -6.8,
                "pickup_longitude": 39.2,
                "pickup_address": "Test Pickup",
                "destination_latitude": -6.9,
                "destination_longitude": 39.3,
                "destination_address": "Test Destination"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/rides/request",
                json=ride_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "ride_request_id" in data
            assert "estimated_fare" in data
            print("✅ Ride request test passed")
            return True
        except Exception as e:
            print(f"❌ Ride request test failed: {e}")
            return False
    
    def test_metrics_endpoint(self):
        """Test Prometheus metrics endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/metrics", timeout=10)
            assert response.status_code == 200
            metrics_text = response.text
            assert "bodaboda_requests_total" in metrics_text
            assert "bodaboda_active_users" in metrics_text
            print("✅ Metrics endpoint test passed")
            return True
        except Exception as e:
            print(f"❌ Metrics test failed: {e}")
            return False
    
    def run_all_tests(self):
        """Run all API tests"""
        print("🧪 Starting BodaBoda API Test Suite...")
        
        tests = [
            self.test_health_endpoint,
            self.test_user_registration,
            self.test_user_login,
            self.test_nearby_drivers,
            self.test_ride_request,
            self.test_metrics_endpoint
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
            else:
                print(f"❌ Test failed: {test.__name__}")
        
        print(f"\n📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed!")
            return True
        else:
            print("💥 Some tests failed!")
            return False

if __name__ == "__main__":
    tester = BodaBodaAPITester()
    
    # Wait for backend to be ready
    print("⏳ Waiting for backend to be ready...")
    for i in range(10):
        try:
            response = requests.get("http://localhost:5000/api/health", timeout=5)
            if response.status_code == 200:
                print("✅ Backend is ready!")
                break
        except:
            time.sleep(2)
    
    # Run tests
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)
