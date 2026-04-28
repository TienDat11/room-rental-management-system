from rest_framework import serializers
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
    class Meta:
        model = Tenant
        fields = [
            "full_name", "id_card", "phone", "email", "date_of_birth",
            "address", "emergency_contact", "room", "status", "notes"
        ]


class TenantUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = [
            "full_name", "id_card", "phone", "email", "date_of_birth",
            "address", "emergency_contact", "room", "status", "notes"
        ]