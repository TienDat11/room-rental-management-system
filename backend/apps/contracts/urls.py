from django.urls import path
from .views import ContractViewSet

urlpatterns = [
    path("", ContractViewSet.as_view({"get": "list", "post": "create"}), name="contracts-list"),
    path("<int:pk>/", ContractViewSet.as_view({"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}), name="contracts-detail"),
]