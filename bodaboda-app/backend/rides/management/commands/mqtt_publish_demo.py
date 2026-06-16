import json

import paho.mqtt.client as mqtt
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Publish a demo MQTT message for presentation and smoke testing."

    def add_arguments(self, parser):
        parser.add_argument(
            "--topic",
            default=f"{settings.MQTT_TOPIC_PREFIX}/ride/request",
            help="Topic to publish to.",
        )
        parser.add_argument(
            "--message",
            required=True,
            help="JSON string payload to publish.",
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
        try:
            payload = json.loads(options["message"])
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON payload: {exc}") from exc

        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        client.connect(options["host"], options["port"], keepalive=30)
        info = client.publish(
            options["topic"],
            payload=json.dumps(payload),
            qos=settings.MQTT_QOS,
        )
        info.wait_for_publish()
        client.disconnect()

        self.stdout.write(
            self.style.SUCCESS(
                f"Published demo message to {options['topic']} on {options['host']}:{options['port']}"
            )
        )
