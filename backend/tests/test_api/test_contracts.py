"""
Tests for Contract API endpoints.
"""
import pytest
from datetime import date, timedelta
from apps.contracts.models import Contract


@pytest.mark.django_db
class TestContractList:
    """Test contract list endpoint."""

    def test_list_contracts_as_admin(self, admin_client, contract):
        """Admin can list all contracts."""
        response = admin_client.get("/api/contracts/")

        assert response.status_code == 200
        assert response.data["count"] == 1

    def test_list_contracts_as_landlord(self, landlord_client, contract):
        """Landlord can list their own contracts."""
        response = landlord_client.get("/api/contracts/")

        assert response.status_code == 200
        assert response.data["count"] == 1

    def test_list_contracts_unauthenticated(self, api_client, contract):
        """Unauthenticated user cannot list contracts."""
        response = api_client.get("/api/contracts/")

        assert response.status_code == 401


@pytest.mark.django_db
class TestContractCreate:
    """Test contract create endpoint."""

    def test_create_contract_as_landlord(self, landlord_client, tenant, room):
        """Landlord can create contract."""
        data = {
            "tenant": tenant.id,
            "room": room.id,
            "start_date": str(date.today()),
            "end_date": str(date.today() + timedelta(days=365)),
            "monthly_rent": "3000000",
            "deposit_amount": "6000000",
        }
        response = landlord_client.post("/api/contracts/", data)

        assert response.status_code == 201

    def test_create_contract_invalid_dates(self, landlord_client, tenant, room):
        """Cannot create contract with end_date before start_date."""
        data = {
            "tenant": tenant.id,
            "room": room.id,
            "start_date": str(date.today() + timedelta(days=365)),
            "end_date": str(date.today()),
            "monthly_rent": "3000000",
        }
        response = landlord_client.post("/api/contracts/", data)

        assert response.status_code == 400

    def test_create_contract_as_tenant(self, tenant_client, tenant, room):
        """Tenant cannot create contracts."""
        data = {
            "tenant": tenant.id,
            "room": room.id,
            "start_date": str(date.today()),
            "end_date": str(date.today() + timedelta(days=365)),
            "monthly_rent": "3000000",
        }
        response = tenant_client.post("/api/contracts/", data)

        assert response.status_code == 403


@pytest.mark.django_db
class TestContractRetrieve:
    """Test contract retrieve endpoint."""

    def test_retrieve_contract_as_landlord(self, landlord_client, contract):
        """Landlord can retrieve their contract."""
        response = landlord_client.get(f"/api/contracts/{contract.id}/")

        assert response.status_code == 200

    def test_retrieve_contract_as_admin(self, admin_client, contract):
        """Admin can retrieve any contract."""
        response = admin_client.get(f"/api/contracts/{contract.id}/")

        assert response.status_code == 200


@pytest.mark.django_db
class TestContractUpdate:
    """Test contract update endpoint."""

    def test_update_contract_as_landlord(self, landlord_client, contract):
        """Landlord can update their contract."""
        response = landlord_client.patch(
            f"/api/contracts/{contract.id}/", {"status": "TERMINATED"}
        )

        assert response.status_code == 200
        assert response.data["status"] == "TERMINATED"


@pytest.mark.django_db
class TestContractDelete:
    """Test contract delete endpoint."""

    def test_delete_contract_as_landlord(self, landlord_client, contract):
        """Landlord can delete their contract."""
        response = landlord_client.delete(f"/api/contracts/{contract.id}/")

        assert response.status_code == 204