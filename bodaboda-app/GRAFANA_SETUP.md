# Grafana Dashboard Setup Guide

## 🎯 Problem: Grafana Shows No Data

Grafana is not showing CPU, Memory, and Disk data because:
1. Prometheus wasn't configured to scrape Node Exporter metrics
2. Grafana needs the correct data source and dashboard

## ✅ Solution: Manual Setup in Grafana

### Step 1: Verify Prometheus is Working
Open: http://localhost:9090/targets
You should see 3 targets:
- prometheus (localhost:9090)
- node-exporter (host.docker.internal:9100) 
- bodaboda-backend (host.docker.internal:5000)

### Step 2: Configure Grafana Data Source
1. Open Grafana: http://localhost:3002
2. Login: admin / admin123
3. Go to **Configuration** (gear icon) → **Data Sources**
4. Click **Add data source**
5. Select **Prometheus**
6. Set:
   - **Name**: Prometheus
   - **URL**: http://localhost:9090
   - **Access**: Browser
7. Click **Save & Test**

### Step 3: Import System Metrics Dashboard
1. Go to **Dashboard** → **Import**
2. Click **Import via dashboard json**
3. Copy and paste the contents of `grafana-dashboard.json`
4. Click **Load**
5. Click **Import**

### Step 4: Alternative - Use Pre-built Dashboard
1. Go to **Dashboard** → **Import**
2. Enter dashboard ID: **1860** (Node Exporter Full)
3. Click **Load**
4. Select Prometheus data source
5. Click **Import**

## 📊 Expected Results

After setup, you should see:
- **CPU Usage**: Real-time CPU percentage
- **Memory Usage**: RAM utilization
- **Disk Usage**: Storage space used
- **Network Traffic**: Network I/O

## 🔧 Troubleshooting

### If still no data:
1. Check Prometheus targets: http://localhost:9090/targets
2. Verify Node Exporter is running: http://localhost:9100/metrics
3. Check Grafana data source connection

### If targets are down:
```bash
docker ps  # Check all containers are running
docker restart node-exporter  # Restart if needed
```

## 🎯 Quick Test

Test Prometheus metrics:
```bash
curl http://localhost:9090/api/v1/query?query=node_cpu_seconds_total
```

This should return CPU metrics data.

## 📱 Final Verification

Once complete, your Grafana dashboard at http://localhost:3002 should show:
- ✅ Real-time CPU graphs
- ✅ Memory usage charts  
- ✅ Disk space monitoring
- ✅ Network traffic data
