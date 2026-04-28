from django.urls import path
from .views import BillViewSet, PaymentViewSet

urlpatterns = [
    path("", BillViewSet.as_view({"get": "list", "post": "create"}), name="bills-list"),
    path("<int:pk>/", BillViewSet.as_view({"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}), name="bills-detail"),
    path("<int:pk>/pay/", BillViewSet.as_view({"post": "pay"}), name="bills-pay"),
    path("payments/", PaymentViewSet.as_view({"get": "list"}), name="payments-list"),
    path("payments/<int:pk>/", PaymentViewSet.as_view({"get": "retrieve"}), name="payments-detail"),
]