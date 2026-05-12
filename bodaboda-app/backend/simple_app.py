#!/usr/bin/env python3
"""
Simple BodaBoda Backend API Server
Lightweight version for quick testing
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Simple in-memory storage for testing
users = []
drivers = []
ride_requests = []

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'service': 'bodaboda-backend'
    })

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['username', 'email', 'password', 'full_name', 'phone_number', 'user_type']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Check if user already exists (simple check)
    for user in users:
        if user['email'] == data['email']:
            return jsonify({'error': 'Email already registered'}), 400
        if user['phone_number'] == data['phone_number']:
            return jsonify({'error': 'Phone number already registered'}), 400
    
    # Create new user
    new_user = {
        'id': len(users) + 1,
        'username': data['username'],
        'email': data['email'],
        'full_name': data['full_name'],
        'phone_number': data['phone_number'],
        'user_type': data['user_type'],
        'is_verified': False,
        'created_at': datetime.utcnow().isoformat()
    }
    
    users.append(new_user)
    
    # If driver, create driver profile
    if data['user_type'] == 'driver':
        driver_profile = {
            'user_id': new_user['id'],
            'license_number': data.get('license_number', ''),
            'vehicle_make': data.get('vehicle_make', ''),
            'vehicle_model': data.get('vehicle_model', ''),
            'vehicle_number': data.get('vehicle_number', ''),
            'vehicle_type': data.get('vehicle_type', 'motorcycle'),
            'rating': 5.0,
            'total_rides': 0,
            'is_available': True
        }
        drivers.append(driver_profile)
    
    return jsonify({
        'message': 'User registered successfully',
        'user': new_user
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login"""
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    # Find user (simple authentication)
    for user in users:
        if user['email'] == data['email']:
            # In production, verify password hash
            return jsonify({
                'message': 'Login successful',
                'access_token': 'simple-token-' + str(user['id']),  # Simple token
                'user': user
            })
    
    return jsonify({'error': 'Invalid email or password'}), 401

@app.route('/api/rides/request', methods=['POST'])
def request_ride():
    """Request a new ride"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['pickup_lat', 'pickup_lng', 'pickup_address', 'dropoff_lat', 'dropoff_lng', 'dropoff_address']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Calculate simple fare
    distance_km = 5.0  # Simplified calculation
    estimated_fare = 10.0 + (distance_km * 2.0)  # Base fare + distance rate
    
    # Create ride request
    ride_request = {
        'id': len(ride_requests) + 1,
        'rider_id': 1,  # Simplified - would come from JWT token
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
    
    ride_requests.append(ride_request)
    
    # Find nearby drivers (simplified)
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
    
    return jsonify({
        'message': 'Ride request created successfully',
        'ride_request': ride_request,
        'nearby_drivers': nearby_drivers
    }), 201

@app.route('/api/drivers/nearby', methods=['GET'])
def get_nearby_drivers():
    """Get nearby available drivers"""
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    
    if not lat or not lng:
        return jsonify({'error': 'Latitude and longitude required'}), 400
    
    # Return sample drivers
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
            'location': {'lat': lat + 0.01, 'lng': lng + 0.01}
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
            'location': {'lat': lat - 0.01, 'lng': lng + 0.02}
        }
    ]
    
    return jsonify({
        'nearby_drivers': nearby_drivers,
        'total_found': len(nearby_drivers)
    })

@app.route('/api/rides/user', methods=['GET'])
def get_user_rides():
    """Get rides for the current user"""
    # Return sample ride history
    return jsonify({
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

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Starting BodaBoda Backend API Server...")
    print("📊 Available endpoints:")
    print("  GET  /api/health - Health check")
    print("  POST /api/auth/register - User registration")
    print("  POST /api/auth/login - User login")
    print("  POST /api/rides/request - Request ride")
    print("  GET  /api/drivers/nearby - Find nearby drivers")
    print("  GET  /api/rides/user - Get user rides")
    print("🌐 Server will be available at: http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
