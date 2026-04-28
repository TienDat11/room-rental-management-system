from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import User
from .serializers import UserSerializer, UserCreateSerializer, UserUpdateSerializer


class IsAdminUser(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.is_admin


class RegisterView(viewsets.GenericViewSet):
    serializer_class = UserCreateSerializer
    permission_classes = [AllowAny]

    @extend_schema(
        request=UserCreateSerializer,
        responses={201: UserSerializer},
        description="Register a new user (Admin only for creating other roles)",
    )
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class MeView(viewsets.GenericViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(description="Get current user profile")
    def list(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return UserUpdateSerializer
        return UserSerializer

    @extend_schema(
        description="List all users (Admin only)",
        responses={200: UserSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        description="Create a new user (Admin only)",
        request=UserCreateSerializer,
        responses={201: UserSerializer},
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        description="Get user by ID (Admin only)",
        responses={200: UserSerializer},
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        description="Update user (Admin only)",
        request=UserUpdateSerializer,
        responses={200: UserSerializer},
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()