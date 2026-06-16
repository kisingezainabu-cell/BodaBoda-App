import json

import paho.mqtt.client as mqtt
from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Subscribe to BodaBoda MQTT topics and print messages in real time."

    def add_arguments(self, parser):
        parser.add_argument(
            "--topic",
            default=f"{settings.MQTT_TOPIC_PREFIX}/ride/#",
            help="MQTT topic filter to subscribe to.",
        )
        parser.add_argument(
            "--host",
            default=settings.MQTT_BROKER_HOST,
            help="MQTT broker host.",
        )
        parser.add_argument(
            "--port",
            default=settings.MQTT_BROKER_PORT,
            type=int,
            help="MQTT broker port.",
        )

    def handle(self, *args, **options):
        topic = options["topic"]
        host = options["host"]
        port = options["port"]

        def on_connect(client, userdata, flags, reason_code, properties=None):
            self.stdout.write(self.style.SUCCESS(f"Connected to MQTT broker at {host}:{port}"))
            client.subscribe(topic, qos=settings.MQTT_QOS)
            self.stdout.write(self.style.SUCCESS(f"Subscribed to {topic}"))

        def on_message(client, userdata, message):
            payload = message.payload.decode("utf-8")
            try:
                payload = json.loads(payload)
                payload = json.dumps(payload, indent=2)
            except json.JSONDecodeError:
                pass
            self.stdout.write(f"\n[{message.topic}]")
            self.stdout.write(payload)

        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        client.on_connect = on_connect
        client.on_message = on_message
        client.connect(host, port, keepalive=30)
        self.stdout.write("Waiting for MQTT messages. Press Ctrl+C to stop.")
        client.loop_forever()
