from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from messaging import build_ride_request_payload, build_ride_status_payload, override_publisher, reset_publisher
from rides.models import Ride

User = get_user_model()


class FakePublisher:
    def __init__(self):
        self.messages = []

    def publish(self, topic, payload):
        self.messages.append((topic, payload))
        return True


class RideMQTTIntegrationTests(TestCase):
    def setUp(self):
        self.publisher = FakePublisher()
        override_publisher(self.publisher)
        self.client = APIClient()
        self.rider = User.objects.create_user(
            username="rider1",
            email="rider1@example.com",
            password="pass1234",
            user_type="rider",
            full_name="Rider One",
        )
        self.driver = User.objects.create_user(
            username="driver1",
            email="driver1@example.com",
            password="pass1234",
            user_type="driver",
            full_name="Driver One",
            is_online=True,
        )

    def tearDown(self):
        reset_publisher()

    def test_request_ride_publishes_mqtt_event(self):
        payload = {
            "pickup_location": "Nyerere Square",
            "destination_location": "UDOM Hostels",
            "price": "3500.00",
            "driver_id": self.driver.id,
            "guest_name": "Guest Passenger",
            "guest_phone": "000-000-0000",
        }

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post("/api/rides/request", payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(self.publisher.messages), 2)
        topics = [topic for topic, _ in self.publisher.messages]
        self.assertIn("bodaboda/ride/request", topics)
        self.assertIn(f"bodaboda/driver/{self.driver.id}/ride/request", topics)
        message = self.publisher.messages[0][1]
        self.assertEqual(message["event"], "ride.requested")
        self.assertEqual(message["pickup_location"], payload["pickup_location"])
        self.assertEqual(message["destination_location"], payload["destination_location"])
        self.assertEqual(message["driver_id"], self.driver.id)

    def test_accept_ride_publishes_status_update(self):
        ride = Ride.objects.create(
            rider=self.rider,
            driver=self.driver,
            pickup_location="Nyerere Square",
            destination_location="UDOM Hostels",
            status="requested",
            price="4000.00",
        )

        self.client.force_authenticate(user=self.driver)
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(f"/api/rides/{ride.id}/accept")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(self.publisher.messages), 2)
        topics = [topic for topic, _ in self.publisher.messages]
        self.assertIn("bodaboda/ride/status", topics)
        self.assertIn(f"bodaboda/driver/{self.driver.id}/ride/status", topics)
        message = self.publisher.messages[0][1]
        self.assertEqual(message["event"], "ride.accepted")
        self.assertEqual(message["status"], "accepted")
        self.assertEqual(message["ride_id"], ride.id)

    def test_updating_status_publishes_status_event(self):
        ride = Ride.objects.create(
            rider=self.rider,
            driver=self.driver,
            pickup_location="Nyerere Square",
            destination_location="UDOM Hostels",
            status="accepted",
        )

        self.client.force_authenticate(user=self.driver)
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(
                f"/api/rides/{ride.id}",
                {"status": "completed"},
                format="json",
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(self.publisher.messages), 2)
        topics = [topic for topic, _ in self.publisher.messages]
        self.assertIn("bodaboda/ride/status", topics)
        self.assertIn(f"bodaboda/driver/{self.driver.id}/ride/status", topics)
        message = self.publisher.messages[0][1]
        self.assertEqual(message["event"], "ride.completed")
        self.assertEqual(message["status"], "completed")

    def test_payload_builders_are_stable_json_shapes(self):
        ride = Ride.objects.create(
            rider=self.rider,
            driver=self.driver,
            pickup_location="Nyerere Square",
            destination_location="UDOM Hostels",
            status="requested",
            price="4500.00",
        )

        request_payload = build_ride_request_payload(ride)
        status_payload = build_ride_status_payload(ride)

        self.assertEqual(request_payload["event"], "ride.requested")
        self.assertEqual(status_payload["event"], "ride.requested")
        self.assertIn("created_at", request_payload)
        self.assertIn("updated_at", status_payload)
