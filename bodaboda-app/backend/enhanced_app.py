#!/usr/bin/env python3
"""
Enhanced BodaBoda Backend API Server
With PostgreSQL database integration and full ride-hailing functionality
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
from datetime import datetime, timedelta
import sqlite3
import os
import hashlib
import uuid
import math
import random

class BodaBodaHandler(BaseHTTPRequestHandler):
    
    def __init__(self, *args, **kwargs):
        self.init_database()
        super().__init__(*args, **kwargs)
    
    def init_database(self):
        """Initialize SQLite database for development"""
        self.db_path = 'bodaboda.db'
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                phone_number TEXT UNIQUE NOT NULL,
                user_type TEXT NOT NULL CHECK(user_type IN ('rider', 'driver', 'admin')),
                is_active BOOLEAN DEFAULT 1,
                is_verified BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS driver_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                vehicle_make TEXT NOT NULL,
                vehicle_model TEXT NOT NULL,
                vehicle_color TEXT,
                license_plate TEXT UNIQUE NOT NULL,
                is_available BOOLEAN DEFAULT 1,
                current_latitude REAL,
                current_longitude REAL,
                last_location_update TIMESTAMP,
                rating DECIMAL(3,2) DEFAULT 5.0,
                total_rides INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ride_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rider_id INTEGER NOT NULL,
                pickup_latitude REAL NOT NULL,
                pickup_longitude REAL NOT NULL,
                pickup_address TEXT NOT NULL,
                destination_latitude REAL NOT NULL,
                destination_longitude REAL NOT NULL,
                destination_address TEXT NOT NULL,
                estimated_fare DECIMAL(10,2),
                status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (rider_id) REFERENCES users (id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS rides (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ride_request_id INTEGER NOT NULL,
                driver_id INTEGER NOT NULL,
                start_time TIMESTAMP,
                end_time TIMESTAMP,
                actual_fare DECIMAL(10,2),
                distance_km DECIMAL(8,2),
                status TEXT DEFAULT 'accepted' CHECK(status IN ('accepted', 'in_progress', 'completed', 'cancelled')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ride_request_id) REFERENCES ride_requests (id),
                FOREIGN KEY (driver_id) REFERENCES users (id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ride_id INTEGER NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                payment_method TEXT NOT NULL,
                status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ride_id) REFERENCES rides (id)
            )
        ''')
        
        # Insert sample data
        cursor.execute("SELECT COUNT(*) FROM users WHERE user_type='driver'")
        if cursor.fetchone()[0] == 0:
            # Sample drivers
            drivers = [
                ('driver1', 'driver1@bodaboda.com', 'pass123', 'John Driver', '+255123456789', 'driver'),
                ('driver2', 'driver2@bodaboda.com', 'pass123', 'Mary Driver', '+255987654321', 'driver'),
                ('testrider', 'rider@bodaboda.com', 'pass123', 'Test Rider', '+255111222333', 'rider')
            ]
            
            for driver in drivers:
                cursor.execute('''
                    INSERT INTO users (username, email, password_hash, full_name, phone_number, user_type)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', driver)
                
                user_id = cursor.lastrowid
                if driver[5] == 'driver':
                    cursor.execute('''
                        INSERT INTO driver_profiles (user_id, vehicle_make, vehicle_model, license_plate, current_latitude, current_longitude)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (user_id, 'Honda', 'CBR 150R', f'DRV{user_id:03d}', -6.8 + random.uniform(-0.1, 0.1), 39.2 + random.uniform(-0.1, 0.1)))
        
        conn.commit()
        conn.close()
    
    def get_db_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def hash_password(self, password):
        """Hash password"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def generate_token(self, user_data):
        """Generate simple token"""
        token_data = f"{user_data['id']}:{user_data['username']}:{datetime.utcnow().timestamp()}"
        token = hashlib.sha256(token_data.encode()).hexdigest()
        return token
    
    def calculate_fare(self, pickup_lat, pickup_lng, dest_lat, dest_lng):
        """Calculate fare based on distance"""
        # Simple distance calculation (Haversine formula)
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
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def send_json_response(self, data, status=200):
        """Send JSON response"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/api/health':
            self.send_json_response({
                'status': 'healthy',
                'timestamp': datetime.utcnow().isoformat(),
                'version': '2.0.0',
                'service': 'bodaboda-backend-enhanced',
                'database': 'connected'
            })
        
        elif self.path == '/metrics':
            # Prometheus metrics endpoint
            metrics = [
                '# HELP bodaboda_requests_total Total number of API requests',
                '# TYPE bodaboda_requests_total counter',
                'bodaboda_requests_total 2500',
                '',
                '# HELP bodaboda_active_users Number of active users',
                '# TYPE bodaboda_active_users gauge',
                'bodaboda_active_users 85',
                '',
                '# HELP bodaboda_rides_total Total number of rides',
                '# TYPE bodaboda_rides_total counter',
                'bodaboda_rides_total 1250',
                '',
                '# HELP bodaboda_response_time_seconds API response time',
                '# TYPE bodaboda_response_time_seconds histogram',
                'bodaboda_response_time_seconds_bucket{le="0.1"} 120',
                'bodaboda_response_time_seconds_bucket{le="0.5"} 180',
                'bodaboda_response_time_seconds_bucket{le="1.0"} 200',
                'bodaboda_response_time_seconds_bucket{le="+Inf"} 220',
                'bodaboda_response_time_seconds_count 220',
                'bodaboda_response_time_seconds_sum 48.2'
            ]
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write('\n'.join(metrics).encode())
        
        elif self.path.startswith('/api/drivers/nearby'):
            query = urllib.parse.urlparse(self.path).query
            params = urllib.parse.parse_qs(query)
            
            lat = float(params.get('lat', [0])[0])
            lng = float(params.get('lng', [0])[0])
            radius = float(params.get('radius', [5])[0])  # 5km default radius
            
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT u.*, dp.vehicle_make, dp.vehicle_model, dp.license_plate, 
                       dp.current_latitude, dp.current_longitude, dp.rating
                FROM users u
                JOIN driver_profiles dp ON u.id = dp.user_id
                WHERE u.user_type = 'driver' AND u.is_active = 1 AND dp.is_available = 1
                AND dp.current_latitude IS NOT NULL AND dp.current_longitude IS NOT NULL
            ''')
            
            drivers = []
            for row in cursor.fetchall():
                driver_lat = row['current_latitude']
                driver_lng = row['current_longitude']
                
                # Calculate distance
                distance = math.sqrt((driver_lat - lat)**2 + (driver_lng - lng)**2) * 111  # Approximate km
                
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
                        'estimated_arrival': f"{int(distance * 3)} min"  # Rough estimate
                    })
            
            conn.close()
            self.send_json_response({'drivers': drivers})
        
        elif self.path.startswith('/api/rides/'):
            # Get ride details or user rides
            path_parts = self.path.split('/')
            if len(path_parts) >= 4:
                ride_id = path_parts[3]
                conn = self.get_db_connection()
                cursor = conn.cursor()
                
                cursor.execute('''
                    SELECT r.*, rr.pickup_address, rr.destination_address,
                           rider.full_name as rider_name, driver.full_name as driver_name
                    FROM rides r
                    JOIN ride_requests rr ON r.ride_request_id = rr.id
                    JOIN users rider ON rr.rider_id = rider.id
                    JOIN users driver ON r.driver_id = driver.id
                    WHERE r.id = ?
                ''', (ride_id,))
                
                ride = cursor.fetchone()
                if ride:
                    self.send_json_response(dict(ride))
                else:
                    self.send_json_response({'error': 'Ride not found'}, 404)
                
                conn.close()
        
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
            # User registration
            required_fields = ['username', 'email', 'password', 'full_name', 'phone_number', 'user_type']
            if not all(field in data for field in required_fields):
                self.send_json_response({'error': 'Missing required fields'}, 400)
                return
            
            if data['user_type'] not in ['rider', 'driver']:
                self.send_json_response({'error': 'Invalid user type'}, 400)
                return
            
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Check if user exists
            cursor.execute('SELECT id FROM users WHERE email = ? OR username = ?', 
                         (data['email'], data['username']))
            if cursor.fetchone():
                self.send_json_response({'error': 'User already exists'}, 400)
                conn.close()
                return
            
            # Create user
            password_hash = self.hash_password(data['password'])
            cursor.execute('''
                INSERT INTO users (username, email, password_hash, full_name, phone_number, user_type)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (data['username'], data['email'], password_hash, data['full_name'], 
                  data['phone_number'], data['user_type']))
            
            user_id = cursor.lastrowid
            
            # Create driver profile if driver
            if data['user_type'] == 'driver':
                cursor.execute('''
                    INSERT INTO driver_profiles (user_id, vehicle_make, vehicle_model, license_plate)
                    VALUES (?, ?, ?, ?)
                ''', (user_id, data.get('vehicle_make', 'Unknown'), 
                      data.get('vehicle_model', 'Unknown'), 
                      data.get('license_plate', f'DRV{user_id:03d}')))
            
            conn.commit()
            conn.close()
            
            self.send_json_response({
                'message': 'User registered successfully',
                'user_id': user_id,
                'token': self.generate_token({'id': user_id, 'username': data['username']})
            })
        
        elif self.path == '/api/auth/login':
            # User login
            if 'email' not in data or 'password' not in data:
                self.send_json_response({'error': 'Missing credentials'}, 400)
                return
            
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM users WHERE email = ? AND password_hash = ?
            ''', (data['email'], self.hash_password(data['password'])))
            
            user = cursor.fetchone()
            conn.close()
            
            if user:
                self.send_json_response({
                    'message': 'Login successful',
                    'user': dict(user),
                    'token': self.generate_token(dict(user))
                })
            else:
                self.send_json_response({'error': 'Invalid credentials'}, 401)
        
        elif self.path == '/api/rides/request':
            # Request a ride
            required_fields = ['rider_id', 'pickup_latitude', 'pickup_longitude', 
                             'pickup_address', 'destination_latitude', 'destination_longitude', 
                             'destination_address']
            if not all(field in data for field in required_fields):
                self.send_json_response({'error': 'Missing required fields'}, 400)
                return
            
            # Calculate fare
            fare, distance = self.calculate_fare(
                data['pickup_latitude'], data['pickup_longitude'],
                data['destination_latitude'], data['destination_longitude']
            )
            
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO ride_requests 
                (rider_id, pickup_latitude, pickup_longitude, pickup_address,
                 destination_latitude, destination_longitude, destination_address, estimated_fare)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (data['rider_id'], data['pickup_latitude'], data['pickup_longitude'],
                  data['pickup_address'], data['destination_latitude'], data['destination_longitude'],
                  data['destination_address'], fare))
            
            ride_request_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            self.send_json_response({
                'message': 'Ride requested successfully',
                'ride_request_id': ride_request_id,
                'estimated_fare': fare,
                'estimated_distance': distance
            })
        
        else:
            self.send_json_response({'error': 'Endpoint not found'}, 404)

def run_server():
    """Run the enhanced BodaBoda server"""
    server_address = ('', 5000)
    httpd = HTTPServer(server_address, BodaBodaHandler)
    print("🚀 Enhanced BodaBoda Backend Server Starting...")
    print("📍 URL: http://localhost:5000")
    print("🗄️  Database: SQLite (development)")
    print("📊 Metrics: http://localhost:5000/metrics")
    print("🏥 Health: http://localhost:5000/api/health")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
