import json
import logging
import uuid
from datetime import date, datetime
from decimal import Decimal

from django.conf import settings
from paho.mqtt import publish

logger = logging.getLogger(__name__)

_publisher = None


def _json_default(value):
    if isinstance(value, Decimal):
        return str(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")


def _topic(*segments):
    prefix = settings.MQTT_TOPIC_PREFIX.strip("/")
    clean_segments = [str(segment).strip("/") for segment in segments]
    return "/".join([prefix, *clean_segments])


class BasePublisher:
    def publish(self, topic, payload):
        raise NotImplementedError


class NullPublisher(BasePublisher):
    def publish(self, topic, payload):
        logger.info("MQTT disabled. Skipping publish to %s", topic)
        return False


class PahoPublisher(BasePublisher):
    def publish(self, topic, payload):
        if not settings.MQTT_ENABLED:
            return False

        publish.single(
            topic=topic,
            payload=json.dumps(payload, default=_json_default),
            hostname=settings.MQTT_BROKER_HOST,
            port=settings.MQTT_BROKER_PORT,
            client_id=f"{settings.MQTT_CLIENT_ID_PREFIX}-{uuid.uuid4().hex[:8]}",
            qos=settings.MQTT_QOS,
            retain=False,
        )
        logger.info("Published MQTT message to %s", topic)
        return True


def get_publisher():
    global _publisher
    if _publisher is None:
        _publisher = PahoPublisher() if settings.MQTT_ENABLED else NullPublisher()
    return _publisher


def override_publisher(publisher):
    global _publisher
    _publisher = publisher


def reset_publisher():
    global _publisher
    _publisher = None


def build_ride_request_payload(ride):
    return {
        "event": "ride.requested",
        "ride_id": ride.id,
        "rider_id": ride.rider_id,
        "driver_id": ride.driver_id,
        "guest_name": ride.guest_name,
        "guest_phone": ride.guest_phone,
        "pickup_location": ride.pickup_location,
        "destination_location": ride.destination_location,
        "pickup_lat": ride.pickup_lat,
        "pickup_lng": ride.pickup_lng,
        "destination_lat": ride.destination_lat,
        "destination_lng": ride.destination_lng,
        "price": ride.price,
        "status": ride.status,
        "created_at": ride.created_at,
    }


def build_ride_status_payload(ride):
    return {
        "event": f"ride.{ride.status}",
        "ride_id": ride.id,
        "rider_id": ride.rider_id,
        "driver_id": ride.driver_id,
        "status": ride.status,
        "pickup_location": ride.pickup_location,
        "destination_location": ride.destination_location,
        "updated_at": ride.updated_at,
    }


def publish_ride_request(ride):
    published = get_publisher().publish(
        _topic("ride", "request"),
        build_ride_request_payload(ride),
    )
    if ride.driver_id:
        get_publisher().publish(
            _topic("driver", ride.driver_id, "ride", "request"),
            build_ride_request_payload(ride),
        )
    return published


def publish_ride_status(ride):
    published = get_publisher().publish(
        _topic("ride", "status"),
        build_ride_status_payload(ride),
    )
    if ride.driver_id:
        get_publisher().publish(
            _topic("driver", ride.driver_id, "ride", "status"),
            build_ride_status_payload(ride),
        )
    return published
