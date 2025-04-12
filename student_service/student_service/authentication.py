from rest_framework_simplejwt.authentication import JWTAuthentication
from student.models import ExternalUser  # or wherever you defined it

class ExternalUserJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user_id = validated_token.get("user_id")
        if not user_id:
            return None

        try:
            return ExternalUser.objects.get(id=user_id)
        except ExternalUser.DoesNotExist:
            return None
