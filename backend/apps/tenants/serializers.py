from rest_framework import serializers
from django.core.validators import MinLengthValidator
from .models import Tenant


class TenantSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source="room.room_number", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Tenant
        fields = [
            "id", "full_name", "id_card", "phone", "email", "date_of_birth",
            "address", "emergency_contact", "room", "room_number", "status",
            "status_display", "notes", "landlord", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "landlord", "created_at", "updated_at"]


class TenantCreateSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(max_length=100)
    id_card = serializers.CharField(max_length=20, validators=[MinLengthValidator(9)])
    phone = serializers.CharField(max_length=15)
    email = serializers.EmailField(max_length=254, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True, max_length=1000)
    emergency_contact = serializers.CharField(max_length=100, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True, max_length=2000)

    class Meta:
        model = Tenant
        fields = [
            "full_name", "id_card", "phone", "email", "date_of_birth",
            "address", "emergency_contact", "room", "status", "notes"
        ]

    def validate_id_card(self, value):
        if Tenant.objects.filter(id_card=value).exists():
            raise serializers.ValidationError("Số CMND/CCCD đã tồn tại.")
        return value


class TenantUpdateSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(max_length=100, required=False)
    id_card = serializers.CharField(max_length=20, validators=[MinLengthValidator(9)], required=False)
    phone = serializers.CharField(max_length=15, required=False)
    email = serializers.EmailField(max_length=254, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True, max_length=1000)
    emergency_contact = serializers.CharField(max_length=100, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True, max_length=2000)

    class Meta:
        model = Tenant
        fields = [
            "full_name", "id_card", "phone", "email", "date_of_birth",
            "address", "emergency_contact", "room", "status", "notes"
        ]

    def validate_id_card(self, value):
        current_id = self.instance.id if self.instance else None
        if Tenant.objects.filter(id_card=value).exclude(id=current_id).exists():
            raise serializers.ValidationError("Số CMND/CCCD đã tồn tại.")
        return value