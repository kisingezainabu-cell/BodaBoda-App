from django.urls import path
from .views import (
    RideRequestView, 
    AvailableRidesView, 
    RideAcceptView, 
    RideDetailView, 
    DriverTripHistoryView
)

urlpatterns = [
    path('request', RideRequestView.as_view(), name='ride-request'),
    path('available', AvailableRidesView.as_view(), name='available-rides'),
    path('<int:pk>/accept', RideAcceptView.as_view(), name='ride-accept'),
    path('<int:pk>', RideDetailView.as_view(), name='ride-detail'),
    path('history', DriverTripHistoryView.as_view(), name='driver-history'),
]
