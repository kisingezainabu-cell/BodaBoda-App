"""
WSGI configuration for BodaBoda Backend Application
"""

import os
from app import app, db

# Set environment configuration
config_name = os.environ.get('FLASK_ENV', 'development')
if config_name == 'docker':
    from config import DockerConfig
    app.config.from_object(DockerConfig)
else:
    from config import config
    app.config.from_object(config[config_name])

# Create database tables if they don't exist
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run()
