# auth_service/users/forms.py

from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.forms import AuthenticationForm


User = get_user_model()

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ("email", "first_name", "last_name", "role", "is_2fa_enabled")


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ("email", "first_name", "last_name", "role", "is_2fa_enabled", "is_active", "is_staff", "is_superuser")


class EmailAdminAuthenticationForm(AuthenticationForm):
    def clean(self):
        email = self.cleaned_data.get('username')  # admin form field is called 'username'
        password = self.cleaned_data.get('password')

        if email and password:
            self.user_cache = authenticate(self.request, email=email, password=password)
            if self.user_cache is None:
                raise forms.ValidationError("Invalid email or password.")
            self.confirm_login_allowed(self.user_cache)

        return self.cleaned_data