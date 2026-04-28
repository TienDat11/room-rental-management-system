from rest_framework import viewsets, permissions
from drf_spectacular.utils import extend_schema
from .models import Contract
from .serializers import ContractSerializer, ContractCreateSerializer, ContractUpdateSerializer


class IsLandlordOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_landlord or request.user.is_admin)

    def has_object_permission(self, request, view, obj):
        return request.user.is_admin or obj.landlord == request.user


class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == "retrieve" and self.request.user.is_tenant:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsLandlordOrAdmin()]

    def get_serializer_class(self):
        if self.action == "create":
            return ContractCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return ContractUpdateSerializer
        return ContractSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Contract.objects.all()
        if user.is_landlord:
            return Contract.objects.filter(landlord=user)
        if user.is_tenant:
            return Contract.objects.filter(tenant__user=user)
        return Contract.objects.none()

    def perform_create(self, serializer):
        serializer.save(landlord=self.request.user)

    @extend_schema(
        description="List contracts (Landlord: own, Tenant: own, Admin: all)",
        responses={200: ContractSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)