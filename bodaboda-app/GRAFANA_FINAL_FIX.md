# 🎯 **FINAL GRAFANA FIX - Use Container Network**

## 🐳 **Container Network Solution**

Both Grafana and Prometheus are on the same Docker network:
- **Grafana IP**: 172.21.0.2
- **Prometheus IP**: 172.21.0.5
- **Network**: bodaboda-network

## 🔧 **Fix Grafana Data Source**

### **Step 1: Open Grafana**
```
URL: http://localhost:3002
Username: admin
Password: admin123
```

### **Step 2: Go to Data Sources**
1. Click **Configuration** (gear icon)
2. Click **Data Sources**

### **Step 3: Edit Prometheus Data Source**
1. Find **Prometheus** in the list
2. Click **Edit** (pen icon)
3. **Change URL** to: `http://prometheus:9090`
4. **Scroll down** and click **Save & Test**

### **Step 4: Alternative URL (if needed)**
If `http://prometheus:9090` doesn't work, try:
```
http://172.21.0.5:9090
```

### **Step 5: Test Connection**
- Should show **"Data source is working"** in green
- If still fails, restart Grafana: `docker restart grafana`

### **Step 6: Verify Data**
1. Click **Explore** (compass icon)
2. Select **Prometheus** as data source
3. Query: `bodaboda_requests_total`
4. Should show data

### **Step 7: Import Dashboard**
1. **Dashboard** → **Import**
2. Dashboard ID: **1860**
3. Select **Prometheus** data source
4. **Import**

## ✅ **Expected Results**
- ✅ System metrics dashboard
- ✅ BodaBoda application metrics
- ✅ Real-time data updates

## 🔍 **Troubleshooting**
```bash
# Check network connectivity
docker exec grafana curl http://prometheus:9090/api/v1/query?query=up

# Restart services if needed
docker restart grafana
docker restart prometheus

# Verify Prometheus targets
curl http://localhost:9090/targets
```
