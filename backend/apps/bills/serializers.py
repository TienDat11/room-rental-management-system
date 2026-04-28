from rest_framework import serializers
from .models import Bill, Payment


class PaymentSerializer(serializers.ModelSerializer):
    method_display = serializers.CharField(source="get_payment_method_display", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id", "bill", "amount", "payment_method", "method_display",
            "payment_date", "notes", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class BillSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source="tenant.full_name", read_only=True)
    room_number = serializers.CharField(source="room.room_number", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    electricity_usage = serializers.SerializerMethodField()
    water_usage = serializers.SerializerMethodField()
    electricity_cost = serializers.SerializerMethodField()
    water_cost = serializers.SerializerMethodField()
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Bill
        fields = [
            "id", "contract", "room", "room_number", "tenant", "tenant_name",
            "bill_month", "bill_year", "room_price",
            "electricity_previous", "electricity_current", "electricity_usage",
            "electricity_price_per_unit", "electricity_cost",
            "water_previous", "water_current", "water_usage",
            "water_price_per_unit", "water_cost",
            "other_fees", "other_fees_description",
            "total_amount", "status", "status_display",
            "due_date", "paid_date", "notes", "payments",
            "created_at", "updated_at"
        ]
        read_only_fields = ["id", "total_amount", "created_at", "updated_at"]

    def get_electricity_usage(self, obj):
        return obj.electricity_current - obj.electricity_previous

    def get_water_usage(self, obj):
        return obj.water_current - obj.water_previous

    def get_electricity_cost(self, obj):
        return (obj.electricity_current - obj.electricity_previous) * obj.electricity_price_per_unit

    def get_water_cost(self, obj):
        return (obj.water_current - obj.water_previous) * obj.water_price_per_unit


class BillCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = [
            "contract", "room", "tenant", "bill_month", "bill_year",
            "room_price", "electricity_previous", "electricity_current",
            "electricity_price_per_unit", "water_previous", "water_current",
            "water_price_per_unit", "other_fees", "other_fees_description",
            "due_date", "notes"
        ]


class BillUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = [
            "bill_month", "bill_year", "room_price",
            "electricity_previous", "electricity_current",
            "electricity_price_per_unit", "water_previous", "water_current",
            "water_price_per_unit", "other_fees", "other_fees_description",
            "status", "due_date", "notes"
        ]


class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["amount", "payment_method", "payment_date", "notes"]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value