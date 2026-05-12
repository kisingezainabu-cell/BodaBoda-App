# 🎯 **EXACT GRAFANA CONFIGURATION STEPS**

## 📊 **Network Status Verified**
- **Grafana IP**: 172.21.0.2
- **Prometheus IP**: 172.21.0.5  
- **Network**: bodaboda-network ✅
- **Connection**: Working ✅

## 🔧 **Step-by-Step Fix**

### **Step 1: Open Grafana**
```
URL: http://localhost:3002
Username: admin
Password: admin123
```

### **Step 2: Navigate to Data Sources**
1. Click **Configuration** (gear icon ⚙️) in left sidebar
2. Click **Data Sources** from dropdown menu

### **Step 3: Edit Prometheus Data Source**
1. Find **Prometheus** in the data sources list
2. Click the **Edit** button (pen icon ✏️) on the right
3. Scroll to **URL** field
4. **Change URL** to: `http://prometheus:9090`
5. **Scroll down** to bottom
6. Click **Save & Test** button

### **Step 4: Verify Connection**
- Should show **"Data source is working"** in green
- If error appears, try alternative URL: `http://172.21.0.5:9090`

### **Step 5: Test Data in Explore**
1. Click **Explore** (compass icon 🧭) in left sidebar
2. Select **Prometheus** from data source dropdown
3. In query box, type: `bodaboda_requests_total`
4. Click **Run query** button
5. Should show data graph

### **Step 6: Import Dashboard**
1. Click **Dashboard** icon (four squares 📊) in left sidebar
2. Click **Import** button
3. Enter Dashboard ID: `1860`
4. Click **Load**
5. Select **Prometheus** as data source
6. Click **Import**

## 🎉 **Expected Results**

✅ **Data Source**: "Data source is working"  
✅ **Explore**: Shows BodaBoda metrics  
✅ **Dashboard**: Node Exporter Full dashboard working  
✅ **Metrics**: Real-time data updating

## 🔍 **Troubleshooting**

### **If connection still fails:**
1. **Restart Grafana**: `docker restart grafana`
2. **Use IP address**: `http://172.21.0.5:9090`
3. **Check Prometheus**: http://localhost:9090/targets
4. **Verify metrics**: http://localhost:5000/metrics

### **Alternative URLs to Try:**
```
http://prometheus:9090
http://172.21.0.5:9090
http://localhost:9090
```

## 📈 **Available Metrics**

### **BodaBoda Application:**
- `bodaboda_requests_total` - API request counter
- `bodaboda_active_users` - Active user count
- `bodaboda_rides_total` - Total rides completed
- `bodaboda_response_time_seconds` - API performance

### **System Metrics:**
- CPU usage percentage
- Memory utilization
- Disk space and I/O
- Network traffic
- System load average

**Follow these exact steps to resolve the Grafana connection issue!**
