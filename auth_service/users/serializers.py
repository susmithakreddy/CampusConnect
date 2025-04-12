from rest_framework import serializers
from .models import User

from django.contrib.auth import authenticate
from rest_framework import serializers

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")
        request = self.context.get('request')
        user = authenticate(request=request, email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid login credentials")

        data["user"] = user
        return data


class TwoFASerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, write_only=True)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'role')