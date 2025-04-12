from django.contrib.auth import authenticate
from django.core.cache import cache
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import LoginSerializer, TwoFASerializer, UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken


import random

def generate_otp():
    return str(random.randint(100000, 999999))

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    # Add custom fields
    refresh['email'] = user.email
    refresh['role'] = user.role

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
def login_view(request):
    serializer = LoginSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = serializer.validated_data['user']

        if user.is_2fa_enabled:
            # 🔥 Send OTP
            otp = generate_otp()
            cache.set(f'otp_{user.email}', otp, timeout=300)  # 5 min cache
            send_mail(
                'Your OTP Code',
                f'Your OTP code is: {otp}',
                'no-reply@campusconnect.com',
                [user.email]
            )
            return Response({'2fa_required': True, 'email': user.email})

        # 🔥 2FA not enabled, issue tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def verify_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    stored_otp = cache.get(f'otp_{email}')

    if stored_otp != otp:
        return Response({'error': 'Invalid or expired OTP'}, status=400)

    user = get_object_or_404(User, email=email)
    cache.delete(f'otp_{email}')
    
    tokens = get_tokens_for_user(user)
    user_data = UserSerializer(user).data

    # Return tokens along with user data
    return Response({**tokens, 'user': user_data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    if not user.check_password(old_password):
        return Response({'detail': 'Old password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

    if not new_password:
        return Response({'detail': 'New password is required.'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    return Response({'detail': 'Password changed successfully.'}, status=status.HTTP_200_OK)