import json
import paho.mqtt.client as mqtt
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

MQTT_BROKER_HOST = getattr(settings, 'MQTT_BROKER_HOST', 'mqtt')
MQTT_BROKER_PORT = getattr(settings, 'MQTT_BROKER_PORT', 1883)

def publish_message(topic, message_dict):
    """
    Publish a dictionary as a JSON message to a given MQTT topic.
    """
    try:
        client = mqtt.Client()
        # Connect to the Mosquitto broker (which is named 'mqtt' in docker-compose)
        client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, 60)
        
        # Convert dict to JSON string
        payload = json.dumps(message_dict)
        
        # Publish
        client.publish(topic, payload)
        client.disconnect()
        
        logger.info(f"Successfully published to {topic}: {payload}")
        return True
    except Exception as e:
        logger.error(f"Failed to publish to MQTT topic {topic}: {e}")
        return False
