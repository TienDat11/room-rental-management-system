from rest_framework import serializers
from django.core.validators import MinValueValidator
from .models import Contract


class ContractSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source="tenant.full_name", read_only=True)
    room_number = serializers.CharField(source="room.room_number", read_only=True)
    landlord_name = serializers.CharField(source="landlord.full_name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Contract
        fields = [
            "id", "tenant", "tenant_name", "room", "room_number",
            "landlord", "landlord_name", "start_date", "end_date",
            "deposit_amount", "monthly_rent", "status", "status_display",
            "terms", "notes", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "landlord", "created_at", "updated_at"]


class ContractCreateSerializer(serializers.ModelSerializer):
    deposit_amount = serializers.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)], required=False)
    monthly_rent = serializers.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    terms = serializers.CharField(required=False, allow_blank=True, max_length=5000)
    notes = serializers.CharField(required=False, allow_blank=True, max_length=2000)

    class Meta:
        model = Contract
        fields = [
            "tenant", "room", "start_date", "end_date",
            "deposit_amount", "monthly_rent", "terms", "notes"
        ]

    def validate(self, attrs):
        if attrs["end_date"] <= attrs["start_date"]:
            raise serializers.ValidationError({"end_date": "End date must be after start date."})
        return attrs


class ContractUpdateSerializer(serializers.ModelSerializer):
    deposit_amount = serializers.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)], required=False)
    monthly_rent = serializers.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)], required=False)
    terms = serializers.CharField(required=False, allow_blank=True, max_length=5000)
    notes = serializers.CharField(required=False, allow_blank=True, max_length=2000)

    class Meta:
        model = Contract
        fields = [
            "tenant", "room", "start_date", "end_date",
            "deposit_amount", "monthly_rent", "status", "terms", "notes"
        ]

    def validate(self, attrs):
        start_date = attrs.get("start_date", self.instance.start_date if self.instance else None)
        end_date = attrs.get("end_date", self.instance.end_date if self.instance else None)
        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError({"end_date": "End date must be after start date."})
        return attrs