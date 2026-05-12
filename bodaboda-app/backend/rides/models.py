from django.db import models
from django.conf import settings

class Ride(models.Model):
    STATUS_CHOICES = (
        ('requested', 'Requested'),
        ('accepted', 'Accepted'),
        ('started', 'Started'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    rider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='rides_as_rider', null=True, blank=True)
    driver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='rides_as_driver')
    
    guest_name = models.CharField(max_length=255, null=True, blank=True)
    guest_phone = models.CharField(max_length=20, null=True, blank=True)
    
    pickup_location = models.CharField(max_length=255)
    destination_location = models.CharField(max_length=255)
    
    # Coordinates (simplified as strings or floats)
    pickup_lat = models.FloatField(null=True, blank=True)
    pickup_lng = models.FloatField(null=True, blank=True)
    destination_lat = models.FloatField(null=True, blank=True)
    destination_lng = models.FloatField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Ride {self.id} - {self.status}"
