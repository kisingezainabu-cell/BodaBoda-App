#!/usr/bin/env python3
"""
BodaBoda Backend API Server
Flask-based REST API for motorcycle ride-hailing service
"""

from flask import Flask, request, jsonify, g
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
from functools import wraps
import math

# Initialize Flask app
app = Flask(__name__)

# Configuration
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'bodaboda-secret-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://bodaboda:password@localhost:5432/bodaboda_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')

app.config.from_object(Config)

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
CORS(app, origins=app.config['CORS_ORIGINS'])

# Database Models
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), unique=True, nullable=False)
    user_type = db.Column(db.String(20), nullable=False)  # 'rider', 'driver', 'admin'
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    driver_profile = db.relationship('DriverProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    ride_requests = db.relationship('RideRequest', backref='rider', foreign_keys='RideRequest.rider_id')
    rides_as_driver = db.relationship('Ride', backref='driver', foreign_keys='Ride.driver_id')

class DriverProfile(db.Model):
    __tablename__ = 'driver_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    license_expiry = db.Column(db.Date, nullable=False)
    vehicle_make = db.Column(db.String(50), nullable=False)
    vehicle_model = db.Column(db.String(50), nullable=False)
    vehicle_number = db.Column(db.String(20), unique=True, nullable=False)
    vehicle_type = db.Column(db.String(20), nullable=False)
    vehicle_color = db.Column(db.String(30))
    years_experience = db.Column(db.Integer, default=0)
    rating = db.Column(db.Numeric(3, 2), default=5.0)
    total_rides = db.Column(db.Integer, default=0)
    is_available = db.Column(db.Boolean, default=True)
    current_location_lat = db.Column(db.Numeric(10, 8))
    current_location_lng = db.Column(db.Numeric(11, 8))
    last_location_update = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RideRequest(db.Model):
    __tablename__ = 'ride_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    rider_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    pickup_location_lat = db.Column(db.Numeric(10, 8), nullable=False)
    pickup_location_lng = db.Column(db.Numeric(11, 8), nullable=False)
    pickup_address = db.Column(db.Text, nullable=False)
    dropoff_location_lat = db.Column(db.Numeric(10, 8), nullable=False)
    dropoff_location_lng = db.Column(db.Numeric(11, 8), nullable=False)
    dropoff_address = db.Column(db.Text, nullable=False)
    estimated_distance_km = db.Column(db.Numeric(8, 2), nullable=False)
    estimated_duration_minutes = db.Column(db.Integer, nullable=False)
    estimated_fare = db.Column(db.Numeric(10, 2), nullable=False)
    ride_status = db.Column(db.String(20), default='pending')
    payment_status = db.Column(db.String(20), default='pending')
    payment_method = db.Column(db.String(20), default='cash')
    special_instructions = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    ride = db.relationship('Ride', backref='request', uselist=False, cascade='all, delete-orphan')

class Ride(db.Model):
    __tablename__ = 'rides'
    
    id = db.Column(db.Integer, primary_key=True)
    ride_request_id = db.Column(db.Integer, db.ForeignKey('ride_requests.id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    actual_start_time = db.Column(db.DateTime)
    actual_end_time = db.DateTime()
    actual_distance_km = db.Column(db.Numeric(8, 2))
    actual_duration_minutes = db.Column(db.Integer)
    actual_fare = db.Column(db.Numeric(10, 2))
    ride_status = db.Column(db.String(20), default='accepted')
    pickup_confirmed_at = db.Column(db.DateTime)
    dropoff_confirmed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    rating = db.relationship('RideRating', backref='ride', uselist=False, cascade='all, delete-orphan')

class RideRating(db.Model):
    __tablename__ = 'ride_ratings'
    
    id = db.Column(db.Integer, primary_key=True)
    ride_id = db.Column(db.Integer, db.ForeignKey('rides.id'), nullable=False)
    rider_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rider_rating = db.Column(db.Integer)
    driver_rating = db.Column(db.Integer)
    rider_comment = db.Column(db.Text)
    driver_comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class DriverLocation(db.Model):
    __tablename__ = 'driver_locations'
    
    id = db.Column(db.Integer, primary_key=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    latitude = db.Column(db.Numeric(10, 8), nullable=False)
    longitude = db.Column(db.Numeric(11, 8), nullable=False)
    accuracy = db.Column(db.Numeric(8, 2))
    speed_kmh = db.Column(db.Numeric(6, 2))
    heading = db.Column(db.Numeric(5, 2))
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)

# Helper functions
def calculate_distance(lat1, lng1, lat2, lng2):
    """Calculate distance between two points in kilometers using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(float(lat1))
    lat2_rad = math.radians(float(lat2))
    delta_lat = math.radians(float(lat2) - float(lat1))
    delta_lng = math.radians(float(lng2) - float(lng1))
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def calculate_fare(distance_km, duration_minutes):
    """Calculate fare based on distance and duration"""
    base_fare = 2.0  # Base fare in local currency
    per_km_rate = 1.5  # Rate per kilometer
    per_minute_rate = 0.1  # Rate per minute
    
    fare = base_fare + (distance_km * per_km_rate) + (duration_minutes * per_minute_rate)
    return round(fare, 2)

def find_nearest_drivers(lat, lng, radius_km=5, limit=10):
    """Find nearest available drivers within specified radius"""
    drivers = db.session.query(DriverProfile, User).join(User).filter(
        DriverProfile.is_available == True,
        DriverProfile.current_location_lat.isnot(None),
        DriverProfile.current_location_lng.isnot(None)
    ).all()
    
    nearby_drivers = []
    for driver_profile, user in drivers:
        distance = calculate_distance(lat, lng, driver_profile.current_location_lat, driver_profile.current_location_lng)
        if distance <= radius_km:
            nearby_drivers.append({
                'driver_id': user.id,
                'driver_name': user.full_name,
                'vehicle_info': {
                    'make': driver_profile.vehicle_make,
                    'model': driver_profile.vehicle_model,
                    'number': driver_profile.vehicle_number,
                    'color': driver_profile.vehicle_color,
                    'type': driver_profile.vehicle_type
                },
                'rating': float(driver_profile.rating),
                'total_rides': driver_profile.total_rides,
                'distance_km': round(distance, 2),
                'location': {
                    'lat': float(driver_profile.current_location_lat),
                    'lng': float(driver_profile.current_location_lng)
                }
            })
    
    # Sort by distance and return limited results
    nearby_drivers.sort(key=lambda x: x['distance_km'])
    return nearby_drivers[:limit]

# Authentication decorators
def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.user_type != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

def driver_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.user_type != 'driver':
            return jsonify({'error': 'Driver access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# API Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

# Authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['username', 'email', 'password', 'full_name', 'phone_number', 'user_type']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate user type
    if data['user_type'] not in ['rider', 'driver']:
        return jsonify({'error': 'Invalid user type'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400
    if User.query.filter_by(phone_number=data['phone_number']).first():
        return jsonify({'error': 'Phone number already registered'}), 400
    
    # Create new user
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        full_name=data['full_name'],
        phone_number=data['phone_number'],
        user_type=data['user_type']
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Create driver profile if user type is driver
    if data['user_type'] == 'driver':
        driver_fields = ['license_number', 'license_expiry', 'vehicle_make', 'vehicle_model', 'vehicle_number', 'vehicle_type']
        for field in driver_fields:
            if field not in data:
                return jsonify({'error': f'Missing required driver field: {field}'}), 400
        
        driver_profile = DriverProfile(
            user_id=user.id,
            license_number=data['license_number'],
            license_expiry=datetime.strptime(data['license_expiry'], '%Y-%m-%d').date(),
            vehicle_make=data['vehicle_make'],
            vehicle_model=data['vehicle_model'],
            vehicle_number=data['vehicle_number'],
            vehicle_type=data['vehicle_type'],
            vehicle_color=data.get('vehicle_color'),
            years_experience=data.get('years_experience', 0)
        )
        
        db.session.add(driver_profile)
        db.session.commit()
    
    # Create access token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name,
            'user_type': user.user_type,
            'is_verified': user.is_verified
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login"""
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 401
    
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name,
            'user_type': user.user_type,
            'is_verified': user.is_verified
        }
    })

# Ride management endpoints
@app.route('/api/rides/request', methods=['POST'])
@jwt_required()
def request_ride():
    """Request a new ride"""
    data = request.get_json()
    current_user_id = get_jwt_identity()
    
    # Validate required fields
    required_fields = ['pickup_lat', 'pickup_lng', 'pickup_address', 'dropoff_lat', 'dropoff_lng', 'dropoff_address']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Calculate distance and fare
    distance_km = calculate_distance(
        data['pickup_lat'], data['pickup_lng'],
        data['dropoff_lat'], data['dropoff_lng']
    )
    estimated_duration = max(5, int(distance_km * 3))  # Rough estimate: 3 minutes per km
    estimated_fare = calculate_fare(distance_km, estimated_duration)
    
    # Create ride request
    ride_request = RideRequest(
        rider_id=current_user_id,
        pickup_location_lat=data['pickup_lat'],
        pickup_location_lng=data['pickup_lng'],
        pickup_address=data['pickup_address'],
        dropoff_location_lat=data['dropoff_lat'],
        dropoff_location_lng=data['dropoff_lng'],
        dropoff_address=data['dropoff_address'],
        estimated_distance_km=distance_km,
        estimated_duration_minutes=estimated_duration,
        estimated_fare=estimated_fare,
        payment_method=data.get('payment_method', 'cash'),
        special_instructions=data.get('special_instructions')
    )
    
    db.session.add(ride_request)
    db.session.commit()
    
    # Find nearby drivers
    nearby_drivers = find_nearest_drivers(data['pickup_lat'], data['pickup_lng'])
    
    return jsonify({
        'message': 'Ride request created successfully',
        'ride_request': {
            'id': ride_request.id,
            'estimated_distance_km': float(ride_request.estimated_distance_km),
            'estimated_duration_minutes': ride_request.estimated_duration_minutes,
            'estimated_fare': float(ride_request.estimated_fare),
            'status': ride_request.ride_status,
            'created_at': ride_request.created_at.isoformat()
        },
        'nearby_drivers': nearby_drivers
    }), 201

@app.route('/api/rides/<int:ride_id>/accept', methods=['POST'])
@driver_required
def accept_ride(ride_id):
    """Accept a ride request (driver only)"""
    current_driver_id = get_jwt_identity()
    
    ride_request = RideRequest.query.get_or_404(ride_id)
    
    if ride_request.ride_status != 'pending':
        return jsonify({'error': 'Ride request is no longer available'}), 400
    
    # Create ride
    ride = Ride(
        ride_request_id=ride_request.id,
        driver_id=current_driver_id,
        ride_status='accepted'
    )
    
    # Update ride request status
    ride_request.ride_status = 'accepted'
    
    # Update driver availability
    driver_profile = DriverProfile.query.filter_by(user_id=current_driver_id).first()
    if driver_profile:
        driver_profile.is_available = False
    
    db.session.add(ride)
    db.session.commit()
    
    return jsonify({
        'message': 'Ride accepted successfully',
        'ride': {
            'id': ride.id,
            'ride_request_id': ride.ride_request_id,
            'driver_id': ride.driver_id,
            'status': ride.ride_status
        }
    })

@app.route('/api/drivers/location', methods=['POST'])
@driver_required
def update_driver_location():
    """Update driver's current location"""
    current_driver_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('latitude') or not data.get('longitude'):
        return jsonify({'error': 'Latitude and longitude required'}), 400
    
    # Update driver profile location
    driver_profile = DriverProfile.query.filter_by(user_id=current_driver_id).first()
    if driver_profile:
        driver_profile.current_location_lat = data['latitude']
        driver_profile.current_location_lng = data['longitude']
        driver_profile.last_location_update = datetime.utcnow()
    
    # Record location history
    location = DriverLocation(
        driver_id=current_driver_id,
        latitude=data['latitude'],
        longitude=data['longitude'],
        accuracy=data.get('accuracy'),
        speed_kmh=data.get('speed_kmh'),
        heading=data.get('heading')
    )
    
    db.session.add(location)
    db.session.commit()
    
    return jsonify({'message': 'Location updated successfully'})

@app.route('/api/drivers/nearby', methods=['GET'])
def get_nearby_drivers():
    """Get nearby available drivers"""
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    radius = request.args.get('radius', 5, type=float)
    limit = request.args.get('limit', 10, type=int)
    
    if not lat or not lng:
        return jsonify({'error': 'Latitude and longitude required'}), 400
    
    nearby_drivers = find_nearest_drivers(lat, lng, radius, limit)
    
    return jsonify({
        'nearby_drivers': nearby_drivers,
        'total_found': len(nearby_drivers)
    })

@app.route('/api/rides/user', methods=['GET'])
@jwt_required()
def get_user_rides():
    """Get rides for the current user"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.user_type == 'rider':
        rides = RideRequest.query.filter_by(rider_id=current_user_id).order_by(RideRequest.created_at.desc()).all()
        return jsonify({
            'rides': [{
                'id': ride.id,
                'pickup_address': ride.pickup_address,
                'dropoff_address': ride.dropoff_address,
                'estimated_fare': float(ride.estimated_fare),
                'status': ride.ride_status,
                'created_at': ride.created_at.isoformat()
            } for ride in rides]
        })
    elif user.user_type == 'driver':
        rides = Ride.query.filter_by(driver_id=current_user_id).order_by(Ride.created_at.desc()).all()
        return jsonify({
            'rides': [{
                'id': ride.id,
                'pickup_address': ride.request.pickup_address,
                'dropoff_address': ride.request.dropoff_address,
                'actual_fare': float(ride.actual_fare) if ride.actual_fare else None,
                'status': ride.ride_status,
                'created_at': ride.created_at.isoformat()
            } for ride in rides]
        })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)
