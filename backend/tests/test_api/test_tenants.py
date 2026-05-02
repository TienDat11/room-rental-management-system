"""
Tests for Tenant API endpoints.
"""
import pytest
from apps.tenants.models import Tenant


@pytest.mark.django_db
class TestTenantList:
    """Test tenant list endpoint."""

    def test_list_tenants_as_admin(self, admin_client, tenant):
        """Admin can list all tenants."""
        response = admin_client.get("/api/tenants/")

        assert response.status_code == 200
        assert response.data["count"] == 1
        assert response.data["results"][0]["full_name"] == "Nguyen Van A"

    def test_list_tenants_as_landlord(self, landlord_client, tenant):
        """Landlord can list their own tenants."""
        response = landlord_client.get("/api/tenants/")

        assert response.status_code == 200
        assert response.data["count"] == 1

    def test_list_tenants_as_tenant_scoped_to_self(self, tenant_client, tenant_user, tenant):
        """Tenant can list their linked profile only."""
        tenant.user = tenant_user
        tenant.save()

        response = tenant_client.get("/api/tenants/")

        assert response.status_code == 200
        assert response.data["count"] == 1
        assert response.data["results"][0]["id"] == tenant.id


@pytest.mark.django_db
class TestTenantCreate:
    """Test tenant create endpoint."""

    def test_create_tenant_as_landlord(self, landlord_client, room):
        """Landlord can create tenant."""
        data = {
            "full_name": "Tran Thi B",
            "id_card": "987654321",
            "phone": "0912345678",
            "email": "tranthib@example.com",
            "room": room.id,
            "status": "ACTIVE",
        }
        response = landlord_client.post("/api/tenants/", data)

        assert response.status_code == 201
        assert response.data["full_name"] == "Tran Thi B"

    def test_create_tenant_duplicate_id_card(self, landlord_client, tenant, room):
        """Cannot create tenant with duplicate id_card."""
        data = {
            "full_name": "Another Person",
            "id_card": "123456789",
            "phone": "0900000000",
            "room": room.id,
            "status": "ACTIVE",
        }
        response = landlord_client.post("/api/tenants/", data)

        assert response.status_code == 400

    def test_create_tenant_as_tenant(self, tenant_client, room):
        """Tenant cannot create other tenants."""
        data = {
            "full_name": "Unauthorized",
            "id_card": "111111111",
            "phone": "0900000000",
            "room": room.id,
        }
        response = tenant_client.post("/api/tenants/", data)

        assert response.status_code == 403


@pytest.mark.django_db
class TestTenantRetrieve:
    """Test tenant retrieve endpoint."""

    def test_retrieve_tenant_as_landlord(self, landlord_client, tenant):
        """Landlord can retrieve their tenant."""
        response = landlord_client.get(f"/api/tenants/{tenant.id}/")

        assert response.status_code == 200
        assert response.data["full_name"] == "Nguyen Van A"

    def test_retrieve_tenant_as_admin(self, admin_client, tenant):
        """Admin can retrieve any tenant."""
        response = admin_client.get(f"/api/tenants/{tenant.id}/")

        assert response.status_code == 200


@pytest.mark.django_db
class TestTenantUpdate:
    """Test tenant update endpoint."""

    def test_update_tenant_as_landlord(self, landlord_client, tenant):
        """Landlord can update their tenant."""
        response = landlord_client.patch(
            f"/api/tenants/{tenant.id}/", {"phone": "0999999999"}
        )

        assert response.status_code == 200
        assert response.data["phone"] == "0999999999"


@pytest.mark.django_db
class TestTenantDelete:
    """Test tenant delete endpoint."""

    def test_delete_tenant_as_landlord(self, landlord_client, tenant):
        """Landlord can delete their tenant."""
        response = landlord_client.delete(f"/api/tenants/{tenant.id}/")

        assert response.status_code == 204

    def test_delete_tenant_as_admin(self, admin_client, tenant):
        """Admin can delete any tenant."""
        response = admin_client.delete(f"/api/tenants/{tenant.id}/")

        assert response.status_code == 204
