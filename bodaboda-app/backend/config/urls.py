from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView


def api_root(request):
    """Root endpoint - shows API info instead of 404."""
    return JsonResponse({
        'service': 'BodaBoda Backend API',
        'status': 'running',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth/',
            'rides': '/api/rides/',
            'docs': '/api/docs/',
            'admin': '/admin/',
            'health': '/api/health/',
        }
    })


def health_check(request):
    """Health check endpoint."""
    return JsonResponse({'status': 'healthy'})


urlpatterns = [
    path('', api_root, name='api-root'),
    path('api/health/', health_check, name='health-check'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/rides/', include('rides.urls')),

    
    # API Schema & Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # Prometheus Metrics
    path('', include('django_prometheus.urls')),
]
