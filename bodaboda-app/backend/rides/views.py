from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Ride
from .serializers import RideSerializer

class RideRequestView(generics.CreateAPIView):
    serializer_class = RideSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        driver_id = self.request.data.get('driver_id')
        rider = self.request.user if self.request.user.is_authenticated else None
        
        # Capture guest info from request body if provided
        guest_name = self.request.data.get('guest_name')
        guest_phone = self.request.data.get('guest_phone')

        # Generate mock Dodoma coordinates (around 35.74, -6.17)
        import random
        p_lat = -6.17 + (random.random() - 0.5) * 0.05
        p_lng = 35.74 + (random.random() - 0.5) * 0.05
        d_lat = -6.17 + (random.random() - 0.5) * 0.05
        d_lng = 35.74 + (random.random() - 0.5) * 0.05

        if driver_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                driver = User.objects.get(id=driver_id)
                serializer.save(
                    rider=rider, 
                    driver=driver, 
                    status='requested',
                    guest_name=guest_name,
                    guest_phone=guest_phone,
                    pickup_lat=p_lat,
                    pickup_lng=p_lng,
                    destination_lat=d_lat,
                    destination_lng=d_lng
                )
            except User.DoesNotExist:
                serializer.save(rider=rider, status='requested', guest_name=guest_name, guest_phone=guest_phone, pickup_lat=p_lat, pickup_lng=p_lng, destination_lat=d_lat, destination_lng=d_lng)
        else:
            serializer.save(rider=rider, status='requested', guest_name=guest_name, guest_phone=guest_phone, pickup_lat=p_lat, pickup_lng=p_lng, destination_lat=d_lat, destination_lng=d_lng)

class AvailableRidesView(generics.ListAPIView):
    serializer_class = RideSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Show rides that are 'requested' and either have no driver or are assigned to the current user
        from django.db.models import Q
        return Ride.objects.filter(
            Q(status='requested') & 
            (Q(driver__isnull=True) | Q(driver=self.request.user))
        ).order_by('-created_at')

class RideAcceptView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            ride = Ride.objects.get(pk=pk, status='requested')
        except Ride.DoesNotExist:
            return Response({'error': 'Ride not available'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.user.user_type != 'driver':
            return Response({'error': 'Only drivers can accept rides'}, status=status.HTTP_403_FORBIDDEN)

        ride.driver = request.user
        ride.status = 'accepted'
        ride.save()
        
        return Response(RideSerializer(ride).data)

class RideDetailView(generics.RetrieveUpdateAPIView):
    queryset = Ride.objects.all()
    serializer_class = RideSerializer
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        ride = self.get_object()
        user = self.request.user
        
        # Permission logic:
        # 1. Driver can update if assigned (requested) or accepted
        # 2. Rider can update if they created it
        # 3. Superuser can do anything
        is_assigned_driver = ride.driver == user
        is_creator = ride.rider == user
        
        if is_assigned_driver or is_creator or user.is_superuser:
            serializer.save()
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to update this ride.")

class DriverTripHistoryView(generics.ListAPIView):
    serializer_class = RideSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Ride.objects.filter(driver=self.request.user, status='completed').order_by('-updated_at')
