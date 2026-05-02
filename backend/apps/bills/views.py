from django.db.models import Sum
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import OpenApiResponse, extend_schema
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

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated(), IsLandlordOrAdmin()]
        return [permissions.IsAuthenticated()]

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


class RevenueReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        description="Revenue summary for landlord/admin scoped bills",
        responses={200: OpenApiResponse(description="Revenue summary")},
    )
    def get(self, request):
        queryset = Bill.objects.all()
        if request.user.is_landlord:
            queryset = queryset.filter(room__landlord=request.user)
        elif request.user.is_tenant:
            queryset = queryset.filter(tenant__user=request.user)

        paid = queryset.filter(status=Bill.Status.PAID)
        pending = queryset.filter(status=Bill.Status.PENDING)
        overdue = queryset.filter(status=Bill.Status.OVERDUE)
        return Response(
            {
                "total_revenue": paid.aggregate(value=Sum("total_amount"))["value"] or 0,
                "pending_amount": pending.aggregate(value=Sum("total_amount"))["value"] or 0,
                "overdue_amount": overdue.aggregate(value=Sum("total_amount"))["value"] or 0,
                "paid_bills": paid.count(),
                "pending_bills": pending.count(),
                "overdue_bills": overdue.count(),
            }
        )


class OccupancyReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        description="Occupancy summary for landlord/admin scoped rooms",
        responses={200: OpenApiResponse(description="Occupancy summary")},
    )
    def get(self, request):
        from apps.rooms.models import Room

        queryset = Room.objects.all()
        if request.user.is_landlord:
            queryset = queryset.filter(landlord=request.user)
        elif request.user.is_tenant:
            queryset = queryset.filter(tenant__user=request.user)

        total_rooms = queryset.count()
        occupied_rooms = queryset.filter(status=Room.Status.OCCUPIED).count()
        available_rooms = queryset.filter(status=Room.Status.AVAILABLE).count()
        maintenance_rooms = queryset.filter(status=Room.Status.MAINTENANCE).count()
        occupancy_rate = round((occupied_rooms / total_rooms) * 100) if total_rooms else 0
        return Response(
            {
                "total_rooms": total_rooms,
                "occupied_rooms": occupied_rooms,
                "available_rooms": available_rooms,
                "maintenance_rooms": maintenance_rooms,
                "occupancy_rate": occupancy_rate,
            }
        )


class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        description="Role-scoped dashboard summary",
        responses={200: OpenApiResponse(description="Dashboard summary")},
    )
    def get(self, request):
        from apps.contracts.models import Contract
        from apps.rooms.models import Room
        from apps.tenants.models import Tenant

        rooms = Room.objects.all()
        tenants = Tenant.objects.all()
        contracts = Contract.objects.all()
        bills = Bill.objects.all()

        if request.user.is_landlord:
            rooms = rooms.filter(landlord=request.user)
            tenants = tenants.filter(landlord=request.user)
            contracts = contracts.filter(landlord=request.user)
            bills = bills.filter(room__landlord=request.user)
        elif request.user.is_tenant:
            rooms = rooms.filter(tenant__user=request.user)
            tenants = tenants.filter(user=request.user)
            contracts = contracts.filter(tenant__user=request.user)
            bills = bills.filter(tenant__user=request.user)

        return Response(
            {
                "rooms": rooms.count(),
                "tenants": tenants.count(),
                "active_contracts": contracts.filter(status=Contract.Status.ACTIVE).count(),
                "pending_bills": bills.filter(status=Bill.Status.PENDING).count(),
                "overdue_bills": bills.filter(status=Bill.Status.OVERDUE).count(),
                "paid_revenue": bills.filter(status=Bill.Status.PAID).aggregate(
                    value=Sum("total_amount")
                )["value"] or 0,
            }
        )
