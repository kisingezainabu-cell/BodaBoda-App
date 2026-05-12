# Grafana Data Source Fix

## ✅ Problem Solved: Network Connection Fixed

**Issue**: Grafana couldn't connect to Prometheus due to network isolation
**Solution**: Both containers now on same `bodaboda-network`

## 🔧 Updated Grafana Data Source Configuration

### Step 1: Update Data Source in Grafana
1. Open: http://localhost:3002 (admin/admin123)
2. Go to **Configuration** → **Data Sources**
3. Click on existing Prometheus data source
4. Change **URL** from `http://localhost:9090` to: `http://prometheus:9090`
5. Click **Save & Test**

### Step 2: Alternative - Create New Data Source
If the above doesn't work:
1. **Add data source** → **Prometheus**
2. **Name**: Prometheus-Docker
3. **URL**: `http://prometheus:9090`
4. **Access**: Browser
5. **Save & Test**

## 📊 Verify Data is Available

Check Prometheus targets: http://localhost:9090/targets
You should see:
- ✅ prometheus (UP)
- ✅ node-exporter (UP) 
- ✅ bodaboda-backend (UP)

## 🎯 Import Dashboard

1. **Dashboard** → **Import**
2. **Upload JSON file** → use `grafana-dashboard.json`
3. Select Prometheus data source
4. **Import**

## 🚀 Expected Results

After fixing the data source, you'll see:
- Real-time CPU graphs
- Memory usage charts
- Disk monitoring
- Network traffic data

## 🔍 Test Connection

Test the connection:
```bash
curl http://localhost:9090/api/v1/query?query=node_cpu_seconds_total
```

This should return CPU metrics data, confirming Prometheus is working.
