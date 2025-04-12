from django.urls import path
from .views import login_view, verify_otp,change_password
from rest_framework_simplejwt.views import (TokenObtainPairView,TokenRefreshView,)

urlpatterns = [
    path('auth/login/', login_view),
    path('auth/verify-otp/', verify_otp),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/change-password/', change_password, name='change-password'),
]
