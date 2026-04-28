from rest_framework import serializers
from .models import Room, RoomImage


class RoomImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomImage
        fields = ["id", "image", "caption", "is_primary", "created_at"]
        read_only_fields = ["id", "created_at"]


class RoomSerializer(serializers.ModelSerializer):
    images = RoomImageSerializer(many=True, read_only=True)
    landlord_name = serializers.CharField(source="landlord.full_name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Room
        fields = [
            "id", "room_number", "floor", "area", "base_price", "status", "status_display",
            "amenities", "description", "landlord", "landlord_name", "images",
            "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at", "landlord"]


class RoomCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ["room_number", "floor", "area", "base_price", "amenities", "description"]


class RoomUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ["room_number", "floor", "area", "base_price", "status", "amenities", "description"]