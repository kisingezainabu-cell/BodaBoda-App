from django.urls import path
from .views import RegisterView, LoginView, UserProfileView, UserManagementView, UserDeleteView, OnlineDriversView

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    path('profile', UserProfileView.as_view(), name='profile'),
    path('online-drivers', OnlineDriversView.as_view(), name='online-drivers'),

    path('manage', UserManagementView.as_view(), name='user-manage'),
    path('manage/<int:pk>', UserDeleteView.as_view(), name='user-delete'),

]
