from rest_framework import viewsets, permissions
from drf_spectacular.utils import extend_schema
from .models import Room
from .serializers import RoomSerializer, RoomCreateSerializer, RoomUpdateSerializer


class IsLandlordOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_landlord or request.user.is_admin)

    def has_object_permission(self, request, view, obj):
        return request.user.is_admin or obj.landlord == request.user


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsLandlordOrAdmin]

    def get_serializer_class(self):
        if self.action == "create":
            return RoomCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return RoomUpdateSerializer
        return RoomSerializer

    def get_queryset(self):
        user = self.request.user
        # Tối ưu: select_related để tránh N+1 queries khi truy cập landlord
        # prefetch_related cho images (nested serializer)
        queryset = Room.objects.select_related("landlord").prefetch_related("images")
        if user.is_admin:
            return queryset
        return queryset.filter(landlord=user)

    def perform_create(self, serializer):
        serializer.save(landlord=self.request.user)

    @extend_schema(
        description="List rooms (Landlord: own rooms, Admin: all rooms)",
        responses={200: RoomSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)