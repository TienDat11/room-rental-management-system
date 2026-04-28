from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RoomViewSet

urlpatterns = [
    path("", RoomViewSet.as_view({"get": "list", "post": "create"}), name="rooms-list"),
    path("<int:pk>/", RoomViewSet.as_view({"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}), name="rooms-detail"),
]