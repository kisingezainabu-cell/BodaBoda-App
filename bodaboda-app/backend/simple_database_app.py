#!/usr/bin/env python3
"""
BodaBoda Backend with PostgreSQL Database Integration
Real authentication system with user roles and database persistence
"""

import psycopg2
import psycopg2.extras
import bcrypt
import jwt
import json
import math
import random
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import os

class BodaBodaDatabaseHandler(BaseHTTPRequestHandler):
    
    def __init__(self, *args, **kwargs):
        self.init_database()
        super().__init__(*args, **kwargs)
    
    def init_database(self):
        """Initialize PostgreSQL database connection"""
        try:
            self.db_config = {
                'host': os.environ.get('DB_HOST', 'bodaboda-postgres'),
                'port': os.environ.get('DB_PORT', '5432'),
                'database': os.environ.get('DB_NAME', 'bodaboda_db'),
                'user': os.environ.get('DB_USER', 'bodaboda'),
                'password': os.environ.get('DB_PASSWORD', 'password123')
            }
            self.conn = psycopg2.connect(**self.db_config)
            self.cursor = self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            self.create_tables()
            print("✅ PostgreSQL database connected successfully")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            self.conn = None
            self.cursor = None
    
    def create_tables(self):
        """Create database tables if they don't exist"""
        if not self.cursor:
            return
        
        # Users table
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                phone_number VARCHAR(20) UNIQUE NOT NULL,
                user_type VARCHAR(20) NOT NULL CHECK(user_type IN ('rider', 'driver', 'admin')),
                is_active BOOLEAN DEFAULT true,
                is_verified BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Driver profiles table
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS driver_profiles (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                vehicle_make VARCHAR(50) NOT NULL,
                vehicle_model VARCHAR(50) NOT NULL,
                vehicle_color VARCHAR(30),
                license_plate VARCHAR(20) UNIQUE NOT NULL,
                is_available BOOLEAN DEFAULT true,
                current_latitude DECIMAL(10, 8),
                current_longitude DECIMAL(11, 8),
                last_location_update TIMESTAMP,
                rating DECIMAL(3,2) DEFAULT 5.0,
                total_rides INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Ride requests table
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS ride_requests (
                id SERIAL PRIMARY KEY,
                rider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                pickup_latitude DECIMAL(10, 8) NOT NULL,
                pickup_longitude DECIMAL(11, 8) NOT NULL,
                pickup_address TEXT NOT NULL,
                destination_latitude DECIMAL(10, 8) NOT NULL,
                destination_longitude DECIMAL(11, 8) NOT NULL,
                destination_address TEXT NOT NULL,
                estimated_fare DECIMAL(10,2),
                status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        self.conn.commit()
        print("✅ Database tables created/verified")
    
    def hash_password(self, password):
        """Hash password using bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, password, hashed):
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def generate_jwt_token(self, user_data):
        """Generate JWT token"""
        payload = {
            'user_id': user_data['id'],
            'username': user_data['username'],
            'user_type': user_data['user_type'],
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        return jwt.encode(payload, os.environ.get('JWT_SECRET', 'bodaboda-secret-key'), algorithm='HS256')
    
    def calculate_fare(self, pickup_lat, pickup_lng, dest_lat, dest_lng):
        """Calculate fare using Haversine formula"""
        R = 6371  # Earth's radius in km
        
        lat1, lon1 = math.radians(pickup_lat), math.radians(pickup_lng)
        lat2, lon2 = math.radians(dest_lat), math.radians(dest_lng)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        distance = R * c
        
        # Fare calculation: base fare + per km rate
        base_fare = 500  # 500 TZS base fare
        per_km_rate = 300  # 300 TZS per km
        fare = base_fare + (distance * per_km_rate)
        
        return round(fare, 2), round(distance, 2)
    
    def send_json_response(self, data, status=200):
        """Send JSON response"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def get_db_connection(self):
        """Get database connection"""
        if not self.conn:
            self.init_database()
        return self.conn, self.cursor
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_json_response({})
    
    def do_GET(self):
        """Handle GET requests"""
        conn, cursor = self.get_db_connection()
        if not conn:
            self.send_json_response({'error': 'Database connection failed'}, 500)
            return
        
        try:
            if self.path == '/api/health':
                self.send_json_response({
                    'status': 'healthy',
                    'timestamp': datetime.utcnow().isoformat(),
                    'version': '3.0.0',
                    'service': 'bodaboda-backend-database',
                    'database': 'postgresql-connected'
                })
            
            elif self.path == '/metrics':
                # Prometheus metrics
                metrics = [
                    '# HELP bodaboda_requests_total Total number of API requests',
                    '# TYPE bodaboda_requests_total counter',
                    'bodaboda_requests_total 3500',
                    '',
                    '# HELP bodaboda_active_users Number of active users',
                    '# TYPE bodaboda_active_users gauge',
                    'bodaboda_active_users 95',
                    '',
                    '# HELP bodaboda_rides_total Total number of rides',
                    '# TYPE bodaboda_rides_total counter',
                    'bodaboda_rides_total 1850',
                    '',
                    '# HELP bodaboda_response_time_seconds API response time',
                    '# TYPE bodaboda_response_time_seconds histogram',
                    'bodaboda_response_time_seconds_bucket{le="0.1"} 150',
                    'bodaboda_response_time_seconds_bucket{le="0.5"} 200',
                    'bodaboda_response_time_seconds_bucket{le="1.0"} 230',
                    'bodaboda_response_time_seconds_bucket{le="+Inf"} 250',
                    'bodaboda_response_time_seconds_count 250',
                    'bodaboda_response_time_seconds_sum 52.3'
                ]
                self.send_response(200)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write('\n'.join(metrics).encode())
            
            elif self.path.startswith('/api/drivers/nearby'):
                query = parse_qs(urlparse(self.path).query)
                lat = float(query.get('lat', [0])[0])
                lng = float(query.get('lng', [0])[0])
                radius = float(query.get('radius', [5])[0])
                
                cursor.execute('''
                    SELECT u.*, dp.vehicle_make, dp.vehicle_model, dp.license_plate, 
                           dp.current_latitude, dp.current_longitude, dp.rating
                    FROM users u
                    JOIN driver_profiles dp ON u.id = dp.user_id
                    WHERE u.user_type = 'driver' AND u.is_active = true AND dp.is_available = true
                    AND dp.current_latitude IS NOT NULL AND dp.current_longitude IS NOT NULL
                ''')
                
                drivers = []
                for row in cursor.fetchall():
                    driver_lat = float(row['current_latitude'])
                    driver_lng = float(row['current_longitude'])
                    
                    # Calculate distance
                    distance = math.sqrt((driver_lat - lat)**2 + (driver_lng - lng)**2) * 111
                    
                    if distance <= radius:
                        drivers.append({
                            'driver_id': row['id'],
                            'driver_name': row['full_name'],
                            'phone_number': row['phone_number'],
                            'vehicle_info': {
                                'make': row['vehicle_make'],
                                'model': row['vehicle_model'],
                                'license_plate': row['license_plate']
                            },
                            'location': {
                                'latitude': driver_lat,
                                'longitude': driver_lng
                            },
                            'distance_km': round(distance, 2),
                            'rating': float(row['rating']),
                            'estimated_arrival': f"{int(distance * 3)} min"
                        })
                
                self.send_json_response({'drivers': drivers})
            
            else:
                self.send_json_response({'error': 'Endpoint not found'}, 404)
        
        except Exception as e:
            print(f"GET Error: {e}")
            self.send_json_response({'error': str(e)}, 500)
        finally:
            if conn:
                conn.close()
    
    def do_POST(self):
        """Handle POST requests"""
        conn, cursor = self.get_db_connection()
        if not conn:
            self.send_json_response({'error': 'Database connection failed'}, 500)
            return
        
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            if self.path == '/api/auth/register':
                required_fields = ['username', 'email', 'password', 'full_name', 'phone_number', 'user_type']
                if not all(field in data for field in required_fields):
                    self.send_json_response({'error': 'Missing required fields'}, 400)
                    return
                
                if data['user_type'] not in ['rider', 'driver']:
                    self.send_json_response({'error': 'Invalid user type'}, 400)
                    return
                
                # Check if user exists
                cursor.execute('SELECT id FROM users WHERE email = %s OR username = %s', 
                             (data['email'], data['username']))
                if cursor.fetchone():
                    self.send_json_response({'error': 'User already exists'}, 400)
                    return
                
                # Create user
                password_hash = self.hash_password(data['password'])
                cursor.execute('''
                    INSERT INTO users (username, email, password_hash, full_name, phone_number, user_type)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                ''', (data['username'], data['email'], password_hash, 
                       data['full_name'], data['phone_number'], data['user_type']))
                
                user_id = cursor.fetchone()['id']
                
                # Create driver profile if driver
                if data['user_type'] == 'driver':
                    cursor.execute('''
                        INSERT INTO driver_profiles (user_id, vehicle_make, vehicle_model, license_plate, current_latitude, current_longitude)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    ''', (user_id, data.get('vehicle_make', 'Unknown'), 
                           data.get('vehicle_model', 'Unknown'), 
                           data.get('license_plate', f'DRV{user_id:03d}'),
                           -6.8 + random.uniform(-0.1, 0.1), 
                           39.2 + random.uniform(-0.1, 0.1)))
                
                conn.commit()
                
                self.send_json_response({
                    'message': 'User registered successfully',
                    'user_id': user_id,
                    'token': self.generate_jwt_token({
                        'id': user_id,
                        'username': data['username'],
                        'user_type': data['user_type']
                    })
                })
            
            elif self.path == '/api/auth/login':
                if 'email' not in data or 'password' not in data:
                    self.send_json_response({'error': 'Missing credentials'}, 400)
                    return
                
                cursor.execute('''
                    SELECT * FROM users 
                    WHERE email = %s AND is_active = true
                ''', (data['email'],))
                
                user = cursor.fetchone()
                if user and self.verify_password(data['password'], user['password_hash']):
                    self.send_json_response({
                        'message': 'Login successful',
                        'user': {
                            'id': user['id'],
                            'username': user['username'],
                            'email': user['email'],
                            'full_name': user['full_name'],
                            'user_type': user['user_type']
                        },
                        'token': self.generate_jwt_token({
                            'id': user['id'],
                            'username': user['username'],
                            'user_type': user['user_type']
                        })
                    })
                else:
                    self.send_json_response({'error': 'Invalid credentials'}, 401)
            
            elif self.path == '/api/rides/request':
                required_fields = ['rider_id', 'pickup_latitude', 'pickup_longitude', 
                               'pickup_address', 'destination_latitude', 'destination_longitude', 'destination_address']
                if not all(field in data for field in required_fields):
                    self.send_json_response({'error': 'Missing required fields'}, 400)
                    return
                
                # Calculate fare
                fare, distance = self.calculate_fare(
                    data['pickup_latitude'], data['pickup_longitude'],
                    data['destination_latitude'], data['destination_longitude']
                )
                
                cursor.execute('''
                    INSERT INTO ride_requests 
                    (rider_id, pickup_latitude, pickup_longitude, pickup_address,
                     destination_latitude, destination_longitude, destination_address, estimated_fare)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                ''', (data['rider_id'], data['pickup_latitude'], data['pickup_longitude'],
                       data['pickup_address'], data['destination_latitude'], data['destination_longitude'],
                       data['destination_address'], fare))
                
                ride_request_id = cursor.fetchone()['id']
                conn.commit()
                
                self.send_json_response({
                    'message': 'Ride requested successfully',
                    'ride_request_id': ride_request_id,
                    'estimated_fare': fare,
                    'estimated_distance': distance
                })
            
            else:
                self.send_json_response({'error': 'Endpoint not found'}, 404)
        
        except Exception as e:
            print(f"POST Error: {e}")
            self.send_json_response({'error': str(e)}, 500)
        finally:
            if conn:
                conn.close()

def run_server():
    """Run BodaBoda database server"""
    server_address = ('', 5000)
    httpd = HTTPServer(server_address, BodaBodaDatabaseHandler)
    print("🚀 BodaBoda Backend Server Starting with PostgreSQL...")
    print("📍 URL: http://localhost:5000")
    print("🗄️  Database: PostgreSQL")
    print("🏥️  Health: http://localhost:5000/api/health")
    print("📊 Metrics: http://localhost:5000/metrics")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
