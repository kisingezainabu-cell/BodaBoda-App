# 🔧 **SYSTEM METRICS FIX - CPU, RAM, Disk**

## 🎯 **Issue**: No CPU, RAM, Disk data in Grafana

## ✅ **Root Cause**: Node Exporter not properly connected to Prometheus

## 🔧 **Complete Fix**

### **Step 1: Check Current Status**
```bash
# Check Node Exporter metrics
curl http://localhost:9100/metrics

# Check Prometheus targets
curl http://localhost:9090/targets
```

### **Step 2: Fix Node Exporter Network**
```bash
# Connect Node Exporter to bodaboda-network
docker network connect bodaboda-network node-exporter
```

### **Step 3: Update Prometheus Configuration**
```bash
docker exec prometheus sh -c "cat > /etc/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'bodaboda-backend'
    static_configs:
      - targets: ['bodaboda-backend-container:5000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
    metrics_path: '/metrics'
    scrape_interval: 5s
EOF"
```

### **Step 4: Restart Prometheus**
```bash
docker restart prometheus
```

### **Step 5: Verify System Metrics**
```bash
# Test CPU metrics
curl "http://localhost:9090/api/v1/query?query=node_cpu_seconds_total"

# Test Memory metrics  
curl "http://localhost:9090/api/v1/query?query=node_memory_MemTotal_bytes"

# Test Disk metrics
curl "http://localhost:9090/api/v1/query?query=node_filesystem_size_bytes"
```

### **Step 6: Update Grafana Dashboard**
1. **Open Grafana**: http://localhost:3002
2. **Explore** → Query: `node_cpu_seconds_total`
3. **Explore** → Query: `node_memory_MemAvailable_bytes`
4. **Explore** → Query: `node_filesystem_avail_bytes`

### **Step 7: Import System Dashboard**
1. **Dashboard** → **Import**
2. **Dashboard ID**: `1860` (Node Exporter Full)
3. **Data Source**: Prometheus
4. **Import**

## 📊 **Expected System Metrics**

### **CPU Metrics:**
- `node_cpu_seconds_total` - CPU time per core
- `100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)` - CPU Usage %

### **Memory Metrics:**
- `node_memory_MemTotal_bytes` - Total memory
- `node_memory_MemAvailable_bytes` - Available memory
- `((1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100)` - Memory Usage %

### **Disk Metrics:**
- `node_filesystem_size_bytes` - Total disk space
- `node_filesystem_avail_bytes` - Available disk space
- `node_filesystem_free_bytes` - Free disk space

### **Network Metrics:**
- `node_network_receive_bytes_total` - Network received
- `node_network_transmit_bytes_total` - Network transmitted

## 🎉 **Final Verification**

After fixes, you should see:
- ✅ CPU usage graphs
- ✅ Memory utilization charts  
- ✅ Disk space monitoring
- ✅ Network traffic data
- ✅ System load averages

**This will resolve the missing CPU, RAM, and disk metrics in Grafana!**
