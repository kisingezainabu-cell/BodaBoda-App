import json
import os

with open('bodaboda-full-dashboard.json', 'r') as f:
    full_dash = json.load(f)

with open('grafana-dashboard.json', 'r') as f:
    sys_dash = json.load(f)

# The system dashboard has a row for System Metrics, let's create a row panel.
sys_row = {
    "collapsed": False,
    "gridPos": {"h": 1, "w": 24, "x": 0, "y": 20},
    "id": 100,
    "panels": [],
    "title": "System Metrics (CPU, RAM, Disk, Network)",
    "type": "row"
}

# Shift grid positions of system dashboard panels
y_offset = 21
for i, panel in enumerate(sys_dash['panels']):
    panel['id'] = 200 + i
    panel['gridPos']['y'] += y_offset
    # Fix datasource
    panel['datasource'] = {
        "type": "prometheus",
        "uid": "${DS_PROMETHEUS}"
    }

full_dash['panels'].append(sys_row)
full_dash['panels'].extend(sys_dash['panels'])
full_dash['title'] = "BodaBoda Ultimate Stack Dashboard"

os.makedirs('monitoring-config/grafana/dashboards', exist_ok=True)
with open('monitoring-config/grafana/dashboards/ultimate-dashboard.json', 'w') as f:
    json.dump(full_dash, f, indent=2)

print("Dashboards merged successfully.")
