from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('rider', 'Rider'),
        ('driver', 'Driver'),
        ('admin', 'Admin'),
    )
    
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='rider')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Driver specific fields (could also be in a separate Profile model, but putting here for simplicity as requested)
    vehicle_make = models.CharField(max_length=100, blank=True, null=True)
    vehicle_model = models.CharField(max_length=100, blank=True, null=True)
    license_plate = models.CharField(max_length=20, blank=True, null=True)
    
    # Tracking fields
    is_online = models.BooleanField(default=False)
    
    # Real-time location
    current_lat = models.FloatField(null=True, blank=True)
    current_lng = models.FloatField(null=True, blank=True)
    
    # Rider/Driver specific info
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)


    def __str__(self):
        return f"{self.username} ({self.user_type})"
