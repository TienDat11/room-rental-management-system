from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserViewSet, RegisterView, MeView, LogoutView

urlpatterns = [
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("register/", RegisterView.as_view(actions={"post": "create"}), name="register"),
    path("me/", MeView.as_view(actions={"get": "list"}), name="me"),
    path("", UserViewSet.as_view({"get": "list", "post": "create"}), name="users-list"),
    path("<int:pk>/", UserViewSet.as_view({"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}), name="users-detail"),
]
