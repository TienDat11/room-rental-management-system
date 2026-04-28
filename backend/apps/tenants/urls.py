from django.urls import path
from .views import TenantViewSet

urlpatterns = [
    path("", TenantViewSet.as_view({"get": "list", "post": "create"}), name="tenants-list"),
    path("<int:pk>/", TenantViewSet.as_view({"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}), name="tenants-detail"),
]