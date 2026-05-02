"""
Tests for User Authentication API endpoints.
"""
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestUserRegistration:
    """Test user registration endpoint."""

    def test_register_user_success(self, api_client):
        """Test successful user registration."""
        data = {
            "username": "newuser",
            "email": "newuser@test.com",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "New User",
            "role": "TENANT",
        }
        response = api_client.post("/api/auth/register/", data)

        assert response.status_code == 201
        assert response.data["username"] == "newuser"
        assert response.data["email"] == "newuser@test.com"
        assert response.data["role"] == "TENANT"

    def test_public_register_can_create_landlord(self, api_client):
        """Test public registration still supports landlord onboarding."""
        data = {
            "username": "newlandlord",
            "email": "newlandlord@test.com",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "New Landlord",
            "role": "LANDLORD",
        }
        response = api_client.post("/api/auth/register/", data)

        assert response.status_code == 201
        assert response.data["role"] == "LANDLORD"

    def test_public_register_cannot_create_admin(self, api_client):
        """Test unauthenticated registration cannot escalate to admin."""
        data = {
            "username": "newadmin",
            "email": "newadmin@test.com",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "New Admin",
            "role": "ADMIN",
        }
        response = api_client.post("/api/auth/register/", data)

        assert response.status_code == 400
        assert not User.objects.filter(username="newadmin").exists()

    def test_register_user_password_mismatch(self, api_client):
        """Test registration with mismatched passwords."""
        data = {
            "username": "newuser",
            "email": "newuser@test.com",
            "password": "password123",
            "password_confirm": "password456",
            "full_name": "New User",
            "role": "TENANT",
        }
        response = api_client.post("/api/auth/register/", data)

        assert response.status_code == 400
        assert "password_confirm" in response.data

    def test_register_user_duplicate_username(self, api_client, admin_user):
        """Test registration with duplicate username."""
        data = {
            "username": "admin",
            "email": "another@test.com",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Another Admin",
            "role": "TENANT",
        }
        response = api_client.post("/api/auth/register/", data)

        assert response.status_code == 400

    def test_register_user_duplicate_email(self, api_client, admin_user):
        """Test registration with duplicate email."""
        data = {
            "username": "newuser",
            "email": "admin@test.com",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "New User",
            "role": "TENANT",
        }
        response = api_client.post("/api/auth/register/", data)

        assert response.status_code == 400


@pytest.mark.django_db
class TestUserLogin:
    """Test user login endpoint (JWT token obtain)."""

    def test_login_success(self, api_client, admin_user):
        """Test successful login returns JWT tokens."""
        data = {
            "username": "admin",
            "password": "admin123",
        }
        response = api_client.post("/api/auth/login/", data)

        assert response.status_code == 200
        assert "access" in response.data
        assert "refresh" in response.data

    def test_login_invalid_username(self, api_client):
        """Test login with invalid username."""
        data = {
            "username": "nonexistent",
            "password": "password123",
        }
        response = api_client.post("/api/auth/login/", data)

        assert response.status_code == 401

    def test_login_invalid_password(self, api_client, admin_user):
        """Test login with invalid password."""
        data = {
            "username": "admin",
            "password": "wrongpassword",
        }
        response = api_client.post("/api/auth/login/", data)

        assert response.status_code == 401


@pytest.mark.django_db
class TestMeEndpoint:
    """Test current user info endpoint."""

    def test_me_authenticated(self, admin_client):
        """Test me endpoint returns current user info."""
        response = admin_client.get("/api/auth/me/")

        assert response.status_code == 200
        assert response.data["username"] == "admin"
        assert response.data["role"] == "ADMIN"

    def test_me_unauthenticated(self, api_client):
        """Test me endpoint rejects unauthenticated requests."""
        response = api_client.get("/api/auth/me/")

        assert response.status_code == 401

    def test_me_landlord_role(self, landlord_client):
        """Test me endpoint for landlord role."""
        response = landlord_client.get("/api/auth/me/")

        assert response.status_code == 200
        assert response.data["role"] == "LANDLORD"

    def test_me_tenant_role(self, tenant_client):
        """Test me endpoint for tenant role."""
        response = tenant_client.get("/api/auth/me/")

        assert response.status_code == 200
        assert response.data["role"] == "TENANT"


@pytest.mark.django_db
class TestTokenRefresh:
    """Test JWT token refresh endpoint."""

    def test_refresh_token_success(self, api_client, admin_user):
        """Test successful token refresh."""
        # First, get tokens via login
        login_response = api_client.post("/api/auth/login/", {
            "username": "admin",
            "password": "admin123",
        })
        refresh_token = login_response.data["refresh"]

        # Then, refresh access token
        response = api_client.post("/api/auth/refresh/", {
            "refresh": refresh_token,
        })

        assert response.status_code == 200
        assert "access" in response.data

    def test_refresh_token_invalid(self, api_client):
        """Test refresh with invalid token."""
        response = api_client.post("/api/auth/refresh/", {
            "refresh": "invalid_token",
        })

        assert response.status_code == 401


@pytest.mark.django_db
class TestLogout:
    """Test logout endpoint used by the frontend."""

    def test_logout_authenticated(self, landlord_client):
        response = landlord_client.post("/api/auth/logout/", {"refresh": "client-side"})

        assert response.status_code == 204

    def test_logout_unauthenticated(self, api_client):
        response = api_client.post("/api/auth/logout/", {})

        assert response.status_code == 401
