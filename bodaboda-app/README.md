# BodaBoda - Motorcycle Ride-Hailing Platform

A comprehensive full-stack motorcycle ride-hailing application built with React, Flask, PostgreSQL, and Docker. This platform connects riders with motorcycle drivers for quick and efficient transportation.

## Complete CI/CD Implementation

This repository now includes a fully automated CI/CD pipeline for the BodaBoda motorcycle ride-hailing application.

### Architecture Overview
The BodaBoda platform consists of:
- **Frontend**: React + Vite application for rider and driver interfaces
- **Backend**: Flask REST API with JWT authentication and real-time features
- **Database**: PostgreSQL with geospatial extensions for location-based queries
- **Webserver**: Nginx for load balancing and SSL termination
- **Monitoring**: Grafana + Prometheus for system metrics
- **Containerization**: Docker and Docker Compose for deployment
- **CI/CD**: GitHub Actions with automated testing and deployment

### CI/CD Pipeline Features
- Automated triggers on push to main/develop branches
- Multi-stage Docker builds with caching
- Automated API testing and security scanning
- Staging deployment on main branch
- Production deployment with manual approval gate
- Docker image tagging and registry push
- Health checks and monitoring integration

## Features

### For Riders
- User registration and authentication
- Real-time driver location tracking
- Ride booking with fare estimation
- Multiple payment methods (cash, mobile money, card)
- Ride history and ratings
- In-app chat support

### For Drivers
- Driver profile management
- Real-time ride requests
- Earnings dashboard
- Route optimization
- Rating system
- Availability management

### For Administrators
- User management
- Ride monitoring
- Analytics and reporting
- System health monitoring
- Revenue tracking

## Prerequisites

- Docker and Docker Compose
- Git
- Make (optional, for deployment scripts)

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd BodaBoda-App/bodaboda-app
```

### 2. Deploy the Application
```bash
# Make the deployment script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

### 3. Access the Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **Grafana Monitoring**: http://localhost:3002 (admin/admin123)
- **Prometheus Metrics**: http://localhost:9090

## Docker Services

The application consists of the following Docker services:

| Service | Port | Description |
|---------|------|-------------|
| frontend | 80 | React application |
| backend | 5000 | Flask API server |
| postgres | 5432 | PostgreSQL database |
| redis | 6379 | Redis cache |
| nginx | 80/443 | Web server and reverse proxy |
| grafana | 3002 | Monitoring dashboard |
| prometheus | 9090 | Metrics collection |
| node-exporter | 9100 | System metrics |

## Database Schema

The PostgreSQL database includes the following main tables:

- **users**: User accounts and authentication
- **driver_profiles**: Driver-specific information
- **ride_requests**: Ride booking requests
- **rides**: Active and completed rides
- **ride_ratings**: Driver and rider ratings
- **payment_transactions**: Payment processing
- **driver_locations**: Real-time driver tracking
- **notifications**: User notifications

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Ride Management
- `POST /api/rides/request` - Request a new ride
- `POST /api/rides/<id>/accept` - Accept ride request (driver)
- `GET /api/rides/user` - Get user's ride history

### Driver Operations
- `POST /api/drivers/location` - Update driver location
- `GET /api/drivers/nearby` - Find nearby drivers

### System
- `GET /api/health` - Health check endpoint

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- SSL/TLS support
- SQL injection prevention
- XSS protection

## Monitoring & Logging

- **Grafana**: Real-time system monitoring
- **Prometheus**: Metrics collection
- **Node Exporter**: System metrics
- **Nginx Logs**: Access and error logging
- **Application Logs**: Structured logging

## Testing

### Run Tests Locally
```bash
# Backend tests
cd backend
python -m pytest tests/

# Frontend tests
npm test
```

### API Testing
```bash
# Health check
curl http://localhost/api/health

# User registration
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123","full_name":"Test User","phone_number":"+1234567890","user_type":"rider"}'
```

## Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
cp backend/.env.example backend/.env
```

Key environment variables:
- `SECRET_KEY`: Flask secret key
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_KEY`: JWT signing key
- `REDIS_URL`: Redis connection string

### Database Configuration
The database is automatically initialized with sample data on first startup.

## Development

### Frontend Development
```bash
cd src
npm run dev
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python app.py
```

## MQTT Integration

### Feature Implemented
- Ride Request Broadcasting
- Ride Status Updates

When a passenger requests a ride, the Django backend publishes an MQTT event immediately. When a driver accepts, cancels, starts, or completes a ride, the backend publishes a ride status event to a second MQTT topic.

### Topics Used
- `bodaboda/ride/request`
- `bodaboda/ride/status`

### Message Format

Ride request event:

```json
{
  "event": "ride.requested",
  "ride_id": 12,
  "rider_id": 4,
  "driver_id": 9,
  "pickup_location": "Nyerere Square",
  "destination_location": "UDOM Hostels",
  "price": "3500.00",
  "status": "requested"
}
```

Ride status event:

```json
{
  "event": "ride.accepted",
  "ride_id": 12,
  "rider_id": 4,
  "driver_id": 9,
  "status": "accepted"
}
```

### How It Works
- Passenger sends `POST /api/rides/request`
- Backend saves the ride and publishes to `bodaboda/ride/request`
- Driver subscriber receives the request instantly through MQTT
- When ride status changes, backend publishes to `bodaboda/ride/status`
- Passenger or monitoring subscriber receives the status update instantly

### Demo Commands

Start the broker with Docker Compose:

```bash
docker compose up -d mqtt
```

Start a subscriber:

```bash
cd backend
source venv/bin/activate
python manage.py mqtt_subscribe --topic bodaboda/ride/#
```

Publish a demo message manually:

```bash
cd backend
source venv/bin/activate
python manage.py mqtt_publish_demo \
  --topic bodaboda/ride/request \
  --message '{"event":"ride.requested","ride_id":99,"pickup_location":"Nyerere Square","destination_location":"UDOM"}'
```

Run automated tests:

```bash
npm test
python tests/mqtt_smoke_test.py
```

## Third-Party Deployment Integration

### Platform Used
- Docker Hub for third-party image registry
- Docker Compose deployment from pulled registry images

### Pipeline Flow
- Build application
- Run Django tests
- Run MQTT publish/receive smoke test
- Build backend and frontend Docker images
- Push images to Docker Hub with:
  - `latest`
  - commit SHA tag
- Pull those same images back from Docker Hub
- Deploy them with `docker-compose.registry.yml`
- Verify MQTT still works after deployment

### Required GitHub Secrets
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

### Registry Deployment File
- [docker-compose.registry.yml](/home/dawilly/Desktop/KSG/bodaboda-app/docker-compose.registry.yml:1)

It deploys:
- PostgreSQL
- Mosquitto
- Backend image pulled from Docker Hub
- Frontend image pulled from Docker Hub

### EC2 Auto-Deploy Notes
- The GitHub Actions workflow now creates `/opt/bodaboda-app` automatically on EC2 if it does not exist.
- It copies:
  - `docker-compose.registry.yml`
  - `mosquitto/mosquitto.conf`
- Then it logs in to Docker Hub over SSH and runs the deployment on the EC2 server.

### No-Domain Production Access
- Production app: `http://EC2_PUBLIC_IP:8080`
- Grafana: `http://EC2_PUBLIC_IP:3002`
- Prometheus: `http://EC2_PUBLIC_IP:9090`

The production frontend uses same-origin routing:
- API calls go to `/api`
- MQTT websocket goes to `/mqtt`

Nginx inside the frontend container proxies those requests to the backend and Mosquitto containers, so browser users do not need direct public access to backend or MQTT ports.

### Hosted MQTT Broker Support
The app can also use a third-party hosted broker by overriding:
- `MQTT_BROKER_HOST`
- `MQTT_BROKER_PORT`
- `MQTT_TOPIC_PREFIX`

This means you can switch from local Mosquitto to HiveMQ Cloud or another hosted broker without changing application code.

### Database Migrations
```bash
cd backend
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## Deployment

### Production Deployment
```bash
# Deploy to production
./deploy.sh

# Scale services
docker-compose -f docker-compose.full.yml up --scale backend=3 -d
```

### SSL Configuration
1. Place SSL certificates in `nginx/ssl/`
2. Uncomment HTTPS configuration in `nginx/sites-available/bodaboda.conf`
3. Restart Nginx

## API Documentation

### Authentication
All API endpoints (except `/api/auth/login` and `/api/auth/register`) require JWT authentication.

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Rate Limits
- General API: 10 requests/second
- Login endpoint: 1 request/second

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if PostgreSQL is running: `docker ps | grep postgres`
   - Verify database credentials in environment variables

2. **Backend API Not Responding**
   - Check backend logs: `docker-compose logs backend`
   - Verify port 5000 is not in use

3. **Frontend Not Loading**
   - Check Nginx configuration: `docker-compose logs nginx`
   - Verify port 80 is not in use

4. **Grafana Login Failed**
   - Default credentials: admin/admin123
   - Check Grafana logs: `docker-compose logs grafana`

### Reset Application
```bash
# Stop all services
docker-compose -f docker-compose.full.yml down

# Remove volumes (WARNING: This deletes all data)
docker-compose -f docker-compose.full.yml down -v

# Restart fresh
./deploy.sh
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Email: support@bodaboda.com
- Documentation: [Link to docs]

## Version History

- **v1.0.0** - Initial release with basic ride-hailing functionality
- **v1.1.0** - Added real-time tracking and notifications
- **v1.2.0** - Enhanced monitoring and analytics
- **v2.0.0** - Complete rewrite with improved architecture
