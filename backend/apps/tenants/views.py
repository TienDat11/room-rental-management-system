from rest_framework import viewsets, permissions
from drf_spectacular.utils import extend_schema
from .models import Tenant
from .serializers import TenantSerializer, TenantCreateSerializer, TenantUpdateSerializer


class IsLandlordOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_landlord or request.user.is_admin)

    def has_object_permission(self, request, view, obj):
        return request.user.is_admin or obj.landlord == request.user


class IsTenant(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_tenant


class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"] and getattr(self.request.user, "is_tenant", False):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsLandlordOrAdmin()]

    def get_serializer_class(self):
        if self.action == "create":
            return TenantCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return TenantUpdateSerializer
        return TenantSerializer

    def get_queryset(self):
        user = self.request.user
        # Tối ưu: select_related để tránh N+1 queries khi truy cập room
        queryset = Tenant.objects.select_related("room", "user", "landlord")
        if user.is_admin:
            return queryset
        if user.is_landlord:
            return queryset.filter(landlord=user)
        if user.is_tenant:
            return queryset.filter(user=user)
        return Tenant.objects.none()

    def perform_create(self, serializer):
        serializer.save(landlord=self.request.user)

    @extend_schema(
        description="List tenants (Landlord: own tenants, Tenant: self, Admin: all)",
        responses={200: TenantSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
