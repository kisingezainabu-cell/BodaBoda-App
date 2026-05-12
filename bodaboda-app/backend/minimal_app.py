#!/usr/bin/env python3
"""
Minimal BodaBoda Backend API Server
No external dependencies required
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
from datetime import datetime
import sqlite3
import os

class BodaBodaHandler(BaseHTTPRequestHandler):
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/api/health':
            self.send_json_response({
                'status': 'healthy',
                'timestamp': datetime.utcnow().isoformat(),
                'version': '1.0.0',
                'service': 'bodaboda-backend'
            })
        elif self.path == '/api/drivers/nearby':
            query = urllib.parse.urlparse(self.path).query
            params = urllib.parse.parse_qs(query)
            
            lat = params.get('lat', [None])[0]
            lng = params.get('lng', [None])[0]
            
            if not lat or not lng:
                self.send_json_response({'error': 'Latitude and longitude required'}, 400)
                return
            
            nearby_drivers = [
                {
                    'driver_id': 1,
                    'driver_name': 'John Driver',
                    'vehicle_info': {
                        'make': 'Honda',
                        'model': 'CBR 150R',
                        'number': 'KCA 123A',
                        'color': 'Red',
                        'type': 'motorcycle'
                    },
                    'rating': 4.8,
                    'total_rides': 150,
                    'distance_km': 1.2,
                    'location': {'lat': float(lat) + 0.01, 'lng': float(lng) + 0.01}
                },
                {
                    'driver_id': 2,
                    'driver_name': 'Mary Rider',
                    'vehicle_info': {
                        'make': 'Yamaha',
                        'model': 'MT-07',
                        'number': 'KCB 456B',
                        'color': 'Blue',
                        'type': 'motorcycle'
                    },
                    'rating': 4.9,
                    'total_rides': 200,
                    'distance_km': 2.8,
                    'location': {'lat': float(lat) - 0.01, 'lng': float(lng) + 0.02}
                }
            ]
            
            self.send_json_response({
                'nearby_drivers': nearby_drivers,
                'total_found': len(nearby_drivers)
            })
        elif self.path == '/api/rides/user':
            self.send_json_response({
                'rides': [
                    {
                        'id': 1,
                        'pickup_address': 'Nairobi CBD',
                        'dropoff_address': 'Westlands',
                        'estimated_fare': 12.50,
                        'status': 'completed',
                        'created_at': '2024-01-15T08:00:00'
                    },
                    {
                        'id': 2,
                        'pickup_address': 'Karen',
                        'dropoff_address': 'Airport',
                        'estimated_fare': 25.00,
                        'status': 'pending',
                        'created_at': '2024-01-15T10:30:00'
                    }
                ]
            })
        else:
            self.send_json_response({'error': 'Endpoint not found'}, 404)
    
    def do_POST(self):
        """Handle POST requests"""
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
        except:
            self.send_json_response({'error': 'Invalid JSON'}, 400)
            return
        
        if self.path == '/api/auth/register':
            required_fields = ['username', 'email', 'password', 'full_name', 'phone_number', 'user_type']
            for field in required_fields:
                if field not in data:
                    self.send_json_response({'error': f'Missing required field: {field}'}, 400)
                    return
            
            new_user = {
                'id': 1,
                'username': data['username'],
                'email': data['email'],
                'full_name': data['full_name'],
                'phone_number': data['phone_number'],
                'user_type': data['user_type'],
                'is_verified': False,
                'created_at': datetime.utcnow().isoformat()
            }
            
            self.send_json_response({
                'message': 'User registered successfully',
                'user': new_user
            }, 201)
            
        elif self.path == '/api/auth/login':
            if not data.get('email') or not data.get('password'):
                self.send_json_response({'error': 'Email and password required'}, 400)
                return
            
            # Simple authentication (in production, verify against database)
            if data['email'] == 'test@bodaboda.com' and data['password'] == 'password':
                user = {
                    'id': 1,
                    'username': 'testuser',
                    'email': data['email'],
                    'full_name': 'Test User',
                    'user_type': 'rider',
                    'is_verified': True
                }
                self.send_json_response({
                    'message': 'Login successful',
                    'access_token': 'simple-token-1',
                    'user': user
                })
            else:
                self.send_json_response({'error': 'Invalid email or password'}, 401)
        
        elif self.path == '/api/rides/request':
            required_fields = ['pickup_lat', 'pickup_lng', 'pickup_address', 'dropoff_lat', 'dropoff_lng', 'dropoff_address']
            for field in required_fields:
                if field not in data:
                    self.send_json_response({'error': f'Missing required field: {field}'}, 400)
                    return
            
            distance_km = 5.0  # Simplified calculation
            estimated_fare = 10.0 + (distance_km * 2.0)
            
            ride_request = {
                'id': 1,
                'rider_id': 1,
                'pickup_location_lat': data['pickup_lat'],
                'pickup_location_lng': data['pickup_lng'],
                'pickup_address': data['pickup_address'],
                'dropoff_location_lat': data['dropoff_lat'],
                'dropoff_location_lng': data['dropoff_lng'],
                'dropoff_address': data['dropoff_address'],
                'estimated_distance_km': distance_km,
                'estimated_duration_minutes': int(distance_km * 3),
                'estimated_fare': estimated_fare,
                'ride_status': 'pending',
                'payment_method': data.get('payment_method', 'cash'),
                'created_at': datetime.utcnow().isoformat()
            }
            
            nearby_drivers = [
                {
                    'driver_id': 1,
                    'driver_name': 'Test Driver',
                    'vehicle_info': {
                        'make': 'Honda',
                        'model': 'CBR 150R',
                        'number': 'KCA 123A',
                        'color': 'Red',
                        'type': 'motorcycle'
                    },
                    'rating': 5.0,
                    'total_rides': 50,
                    'distance_km': 2.5,
                    'location': {'lat': -1.2921, 'lng': 36.8219}
                }
            ]
            
            self.send_json_response({
                'message': 'Ride request created successfully',
                'ride_request': ride_request,
                'nearby_drivers': nearby_drivers
            }, 201)
        
        else:
            self.send_json_response({'error': 'Endpoint not found'}, 404)
    
    def send_json_response(self, data, status_code=200):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response_data = json.dumps(data, indent=2)
        self.wfile.write(response_data.encode('utf-8'))
    
    def log_message(self, format, *args):
        """Custom log message"""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

def run_server():
    """Run the HTTP server"""
    server_address = ('', 5000)
    httpd = HTTPServer(server_address, BodaBodaHandler)
    
    print("🚀 Starting BodaBoda Backend API Server...")
    print("📊 Available endpoints:")
    print("  GET  /api/health - Health check")
    print("  POST /api/auth/register - User registration")
    print("  POST /api/auth/login - User login (test@bodaboda.com / password)")
    print("  POST /api/rides/request - Request ride")
    print("  GET  /api/drivers/nearby?lat=X&lng=Y - Find nearby drivers")
    print("  GET  /api/rides/user - Get user rides")
    print("🌐 Server will be available at: http://localhost:5000")
    print("🔧 Using minimal Python HTTP server (no external dependencies)")
    print("⚡ Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
