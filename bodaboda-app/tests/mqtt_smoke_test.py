#!/usr/bin/env python3
import json
import os
import sys
import threading
import uuid

import paho.mqtt.client as mqtt
from paho.mqtt import publish as mqtt_publish


BROKER_HOST = os.environ.get("MQTT_BROKER_HOST", "127.0.0.1")
BROKER_PORT = int(os.environ.get("MQTT_BROKER_PORT", "1883"))
TOPIC = os.environ.get("MQTT_SMOKE_TOPIC", f"bodaboda/test/{uuid.uuid4().hex}")
MESSAGE = {
    "event": "mqtt.smoke",
    "message": "publish-receive-ok",
}


def main():
    received = []
    received_event = threading.Event()
    subscribed_event = threading.Event()

    subscriber = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    def on_connect(client, userdata, flags, reason_code, properties=None):
        client.subscribe(TOPIC, qos=1)

    def on_subscribe(client, userdata, mid, reason_codes, properties=None):
        subscribed_event.set()

    def on_message(client, userdata, message):
        received.append(json.loads(message.payload.decode("utf-8")))
        received_event.set()

    subscriber.on_connect = on_connect
    subscriber.on_subscribe = on_subscribe
    subscriber.on_message = on_message

    subscriber.connect(BROKER_HOST, BROKER_PORT, keepalive=30)
    subscriber.loop_start()

    if not subscribed_event.wait(timeout=10):
        print(f"MQTT smoke test failed: subscriber did not subscribe to {TOPIC}")
        subscriber.loop_stop()
        subscriber.disconnect()
        return 1

    mqtt_publish.single(
        TOPIC,
        payload=json.dumps(MESSAGE),
        hostname=BROKER_HOST,
        port=BROKER_PORT,
        qos=1,
    )

    if not received_event.wait(timeout=10):
        print(f"MQTT smoke test failed: no message received on {TOPIC}")
        subscriber.loop_stop()
        subscriber.disconnect()
        return 1

    subscriber.loop_stop()
    subscriber.disconnect()

    if received[0] != MESSAGE:
        print("MQTT smoke test failed: payload mismatch")
        print(f"expected={MESSAGE}")
        print(f"actual={received[0]}")
        return 1

    print(f"MQTT smoke test passed on {BROKER_HOST}:{BROKER_PORT} topic {TOPIC}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
