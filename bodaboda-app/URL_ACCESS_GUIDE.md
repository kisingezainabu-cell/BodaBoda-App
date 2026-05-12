# BodaBoda Application - URL Access Guide

## 🌐 All Service URLs (Clickable in Browser)

### 🏠 **Frontend Application**
```
URL: http://localhost:81
Container: bodaboda-frontend
Status: ✅ Running
Description: Main BodaBoda ride-hailing application
```

### 🔧 **Backend API**
```
URL: http://localhost:5000
Container: bodaboda-backend-container
Status: ✅ Running
Description: REST API for the application
Health Check: http://localhost:5000/api/health
```

### 📊 **Grafana Monitoring**
```
URL: http://localhost:3002
Container: grafana
Login: admin / admin123
Status: ✅ Running
Description: System monitoring dashboard
```

### 📈 **Prometheus Metrics**
```
URL: http://localhost:9090
Container: prometheus
Status: ✅ Running
Description: Metrics collection and querying
```

### 🔍 **Node Exporter**
```
URL: http://localhost:9100
Container: node-exporter
Status: ✅ Running
Description: System metrics exporter
```

## 🧪 **Testing the Backend API**

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Find Nearby Drivers
```bash
curl "http://localhost:5000/api/drivers/nearby?lat=-1.2921&lng=36.8219"
```

### User Login (Test)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@bodaboda.com","password":"password"}'
```

## 🐳 **Docker Container Status**

All containers are running correctly:
- ✅ bodaboda-frontend (port 81)
- ✅ bodaboda-backend-container (port 5000)
- ✅ grafana (port 3002)
- ✅ prometheus (port 9090)
- ✅ node-exporter (port 9100)

## 🔧 **If URLs Don't Show as Clickable**

If your IDE doesn't show clickable URLs for Docker containers, manually copy and paste these URLs into your browser:

1. **Frontend**: http://localhost:81
2. **Backend API**: http://localhost:5000
3. **Grafana**: http://localhost:3002
4. **Prometheus**: http://localhost:9090

## 📱 **Mobile Access**

You can also access these services from mobile devices on the same network:
- Replace `localhost` with your computer's IP address
- Example: http://192.168.1.100:81 (frontend)

## 🚀 **Quick Start**

1. Open http://localhost:81 for the main application
2. Open http://localhost:3002 for monitoring
3. Test API at http://localhost:5000/api/health
