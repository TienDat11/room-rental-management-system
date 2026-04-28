from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from .models import Bill, Payment
from .serializers import (
    BillSerializer, BillCreateSerializer, BillUpdateSerializer,
    PaymentSerializer, PaymentCreateSerializer
)


class IsLandlordOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_landlord or request.user.is_admin)

    def has_object_permission(self, request, view, obj):
        return request.user.is_admin or obj.room.landlord == request.user


class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return BillCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return BillUpdateSerializer
        elif self.action == "pay":
            return PaymentCreateSerializer
        return BillSerializer

    def get_queryset(self):
        user = self.request.user
        # Tối ưu: select_related để tránh N+1 queries khi truy cập tenant, room, contract
        # prefetch_related cho payments (nested serializer)
        queryset = Bill.objects.select_related(
            "tenant", "room", "contract", "tenant__user"
        ).prefetch_related("payments")
        if user.is_admin:
            return queryset
        if user.is_landlord:
            return queryset.filter(room__landlord=user)
        if user.is_tenant:
            return queryset.filter(tenant__user=user)
        return Bill.objects.none()

    @extend_schema(
        description="List bills (Landlord: own rooms, Tenant: own, Admin: all)",
        responses={200: BillSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        request=PaymentCreateSerializer,
        responses={201: PaymentSerializer},
        description="Create a payment for this bill",
    )
    @action(detail=True, methods=["post"], serializer_class=PaymentCreateSerializer)
    def pay(self, request, pk=None):
        bill = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = Payment.objects.create(bill=bill, **serializer.validated_data)
        bill.paid_date = payment.payment_date
        bill.status = Bill.Status.PAID
        bill.save()
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Tối ưu: select_related để tránh N+1 queries khi truy cập bill
        queryset = Payment.objects.select_related("bill", "bill__room", "bill__tenant")
        if user.is_admin:
            return queryset
        if user.is_landlord:
            return queryset.filter(bill__room__landlord=user)
        if user.is_tenant:
            return queryset.filter(bill__tenant__user=user)
        return Payment.objects.none()