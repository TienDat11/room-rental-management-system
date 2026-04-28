from rest_framework import serializers
from django.core.validators import MinValueValidator
from .models import Room, RoomImage


class RoomImageSerializer(serializers.ModelSerializer):
    caption = serializers.CharField(max_length=200, required=False, allow_blank=True)

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
    room_number = serializers.CharField(max_length=20)
    floor = serializers.IntegerField(validators=[MinValueValidator(1)])
    area = serializers.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(1)])
    base_price = serializers.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    amenities = serializers.CharField(required=False, allow_blank=True, max_length=1000)
    description = serializers.CharField(required=False, allow_blank=True, max_length=2000)

    class Meta:
        model = Room
        fields = ["room_number", "floor", "area", "base_price", "amenities", "description"]

    def validate_room_number(self, value):
        if Room.objects.filter(room_number=value).exists():
            raise serializers.ValidationError("Số phòng đã tồn tại.")
        return value


class RoomUpdateSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(max_length=20, required=False)
    floor = serializers.IntegerField(validators=[MinValueValidator(1)], required=False)
    area = serializers.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(1)], required=False)
    base_price = serializers.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)], required=False)
    amenities = serializers.CharField(required=False, allow_blank=True, max_length=1000)
    description = serializers.CharField(required=False, allow_blank=True, max_length=2000)

    class Meta:
        model = Room
        fields = ["room_number", "floor", "area", "base_price", "status", "amenities", "description"]