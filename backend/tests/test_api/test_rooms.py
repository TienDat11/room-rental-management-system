"""
Tests for Room API endpoints.
"""
import pytest
from apps.rooms.models import Room


@pytest.mark.django_db
class TestRoomList:
    """Test room list endpoint."""

    def test_list_rooms_as_admin(self, admin_client, room, another_room):
        """Admin can list all rooms."""
        response = admin_client.get("/api/rooms/")

        assert response.status_code == 200
        assert response.data["count"] == 2

    def test_list_rooms_as_landlord(self, landlord_client, room, another_room):
        """Landlord can only see their own rooms."""
        response = landlord_client.get("/api/rooms/")

        assert response.status_code == 200
        assert response.data["count"] == 1
        assert response.data["results"][0]["room_number"] == "101"

    def test_list_rooms_as_tenant_scoped_to_current_room(self, tenant_client, tenant_user, tenant, room):
        """Tenant can list their current room only."""
        tenant.user = tenant_user
        tenant.save()

        response = tenant_client.get("/api/rooms/")

        assert response.status_code == 200
        assert response.data["count"] == 1
        assert response.data["results"][0]["id"] == room.id

    def test_list_rooms_unauthenticated(self, api_client, room):
        """Unauthenticated user cannot list rooms."""
        response = api_client.get("/api/rooms/")

        assert response.status_code == 401


@pytest.mark.django_db
class TestRoomCreate:
    """Test room create endpoint."""

    def test_create_room_as_landlord(self, landlord_client):
        """Landlord can create room."""
        data = {
            "room_number": "201",
            "floor": 2,
            "area": 30.0,
            "base_price": "3500000",
        }
        response = landlord_client.post("/api/rooms/", data)

        assert response.status_code == 201
        assert response.data["room_number"] == "201"

    def test_create_room_as_admin(self, admin_client):
        """Admin can create room."""
        data = {
            "room_number": "301",
            "floor": 3,
            "area": 28.0,
            "base_price": "4000000",
        }
        response = admin_client.post("/api/rooms/", data)

        assert response.status_code == 201
        assert response.data["room_number"] == "301"

    def test_create_room_duplicate_number(self, landlord_client, room):
        """Cannot create room with duplicate room_number."""
        data = {
            "room_number": "101",
            "floor": 2,
            "area": 30.0,
            "base_price": "3500000",
        }
        response = landlord_client.post("/api/rooms/", data)

        assert response.status_code == 400

    def test_create_room_as_tenant(self, tenant_client):
        """Tenant cannot create rooms."""
        data = {
            "room_number": "401",
            "floor": 4,
            "area": 25.0,
            "base_price": "3000000",
        }
        response = tenant_client.post("/api/rooms/", data)

        assert response.status_code == 403

    def test_create_room_missing_fields(self, landlord_client):
        """Cannot create room without required fields."""
        data = {"floor": 1}
        response = landlord_client.post("/api/rooms/", data)

        assert response.status_code == 400


@pytest.mark.django_db
class TestRoomRetrieve:
    """Test room retrieve endpoint."""

    def test_retrieve_room_as_admin(self, admin_client, room):
        """Admin can retrieve any room."""
        response = admin_client.get(f"/api/rooms/{room.id}/")

        assert response.status_code == 200
        assert response.data["room_number"] == "101"

    def test_retrieve_room_as_owner(self, landlord_client, room):
        """Landlord can retrieve their own room."""
        response = landlord_client.get(f"/api/rooms/{room.id}/")

        assert response.status_code == 200
        assert response.data["room_number"] == "101"

    def test_retrieve_room_non_owner(self, landlord_client, another_room):
        """Landlord cannot retrieve other landlord's room."""
        response = landlord_client.get(f"/api/rooms/{another_room.id}/")

        assert response.status_code == 404


@pytest.mark.django_db
class TestRoomUpdate:
    """Test room update endpoint."""

    def test_update_room_as_owner(self, landlord_client, room):
        """Landlord can update their own room."""
        response = landlord_client.patch(
            f"/api/rooms/{room.id}/", {"base_price": "4000000"}
        )

        assert response.status_code == 200
        assert response.data["base_price"] == "4000000.00"

    def test_update_room_as_admin(self, admin_client, room):
        """Admin can update any room."""
        response = admin_client.patch(
            f"/api/rooms/{room.id}/", {"status": "MAINTENANCE"}
        )

        assert response.status_code == 200
        assert response.data["status"] == "MAINTENANCE"

    def test_update_room_non_owner(self, landlord_client, another_room):
        """Landlord cannot update other landlord's room."""
        response = landlord_client.patch(
            f"/api/rooms/{another_room.id}/", {"base_price": "5000000"}
        )

        assert response.status_code == 404


@pytest.mark.django_db
class TestRoomDelete:
    """Test room delete endpoint."""

    def test_delete_room_as_owner(self, landlord_client, room):
        """Landlord can delete their own room (soft delete)."""
        response = landlord_client.delete(f"/api/rooms/{room.id}/")

        assert response.status_code == 204

    def test_delete_room_as_admin(self, admin_client, room):
        """Admin can delete any room."""
        response = admin_client.delete(f"/api/rooms/{room.id}/")

        assert response.status_code == 204

    def test_delete_room_non_owner(self, landlord_client, another_room):
        """Landlord cannot delete other landlord's room."""
        response = landlord_client.delete(f"/api/rooms/{another_room.id}/")

        assert response.status_code == 404
