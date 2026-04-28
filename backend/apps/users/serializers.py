from rest_framework import serializers
from django.core.validators import MinLengthValidator
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "full_name", "phone", "role", "is_active"]
        read_only_fields = ["id"]


class UserCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=50, validators=[MinLengthValidator(3)])
    password = serializers.CharField(write_only=True, style={"input_type": "password"}, max_length=128)
    password_confirm = serializers.CharField(write_only=True, style={"input_type": "password"}, max_length=128)
    email = serializers.EmailField(max_length=254)
    full_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=15, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password_confirm", "full_name", "phone", "role"]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Tên đăng nhập đã tồn tại.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email đã tồn tại.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User.objects.create_user(**validated_data, password=password)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=254)
    full_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=15, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["email", "full_name", "phone", "role", "is_active"]

    def validate_email(self, value):
        current_id = self.instance.id if self.instance else None
        if User.objects.filter(email=value).exclude(id=current_id).exists():
            raise serializers.ValidationError("Email đã tồn tại.")
        return value