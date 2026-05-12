from rest_framework import serializers
from .models import Ride
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'phone_number', 'vehicle_make', 'license_plate')

class RideSerializer(serializers.ModelSerializer):
    rider_details = UserSimpleSerializer(source='rider', read_only=True)
    driver_details = UserSimpleSerializer(source='driver', read_only=True)

    class Meta:
        model = Ride
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
