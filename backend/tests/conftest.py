"""
Pytest configuration and fixtures for Room Rental Management System.
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.rooms.models import Room
from apps.tenants.models import Tenant
from apps.contracts.models import Contract
from apps.bills.models import Bill, Payment

User = get_user_model()


# ============ User Fixtures ============

@pytest.fixture
def admin_user():
    """Create an admin user for testing."""
    return User.objects.create_user(
        username="admin",
        email="admin@test.com",
        password="admin123",
        role=User.Role.ADMIN,
        is_staff=True,
    )


@pytest.fixture
def landlord_user():
    """Create a landlord user for testing."""
    return User.objects.create_user(
        username="landlord",
        email="landlord@test.com",
        password="landlord123",
        role=User.Role.LANDLORD,
    )


@pytest.fixture
def tenant_user():
    """Create a tenant user for testing."""
    return User.objects.create_user(
        username="tenant",
        email="tenant@test.com",
        password="tenant123",
        role=User.Role.TENANT,
    )


# ============ API Client Fixtures ============

@pytest.fixture
def api_client():
    """Unauthenticated API client."""
    return APIClient()


@pytest.fixture
def admin_client(api_client, admin_user):
    """Authenticated admin client."""
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def landlord_client(api_client, landlord_user):
    """Authenticated landlord client."""
    api_client.force_authenticate(user=landlord_user)
    return api_client


@pytest.fixture
def tenant_client(api_client, tenant_user):
    """Authenticated tenant client."""
    api_client.force_authenticate(user=tenant_user)
    return api_client


# ============ Model Fixtures ============

@pytest.fixture
def room(landlord_user):
    """Create a room for testing."""
    return Room.objects.create(
        room_number="101",
        floor=1,
        area=25.0,
        base_price=3000000,
        status=Room.Status.AVAILABLE,
        landlord=landlord_user,
    )


@pytest.fixture
def another_room(landlord_user, admin_user):
    """Create another room owned by admin for testing RBAC."""
    return Room.objects.create(
        room_number="102",
        floor=1,
        area=30.0,
        base_price=3500000,
        status=Room.Status.AVAILABLE,
        landlord=admin_user,
    )


@pytest.fixture
def tenant(landlord_user, room):
    """Create a tenant for testing."""
    return Tenant.objects.create(
        full_name="Nguyen Van A",
        id_card="123456789",
        phone="0901234567",
        email="tenant@example.com",
        room=room,
        landlord=landlord_user,
    )


@pytest.fixture
def contract(landlord_user, tenant, room):
    """Create a contract for testing."""
    from datetime import date, timedelta

    return Contract.objects.create(
        tenant=tenant,
        room=room,
        landlord=landlord_user,
        start_date=date.today(),
        end_date=date.today() + timedelta(days=365),
        monthly_rent=3000000,
        deposit_amount=6000000,
        status=Contract.Status.ACTIVE,
    )


@pytest.fixture
def bill(contract, room, tenant):
    """Create a bill for testing."""
    from datetime import date

    today = date.today()

    return Bill.objects.create(
        contract=contract,
        room=room,
        tenant=tenant,
        bill_month=today.month,
        bill_year=today.year,
        room_price=3000000,
        electricity_previous=100,
        electricity_current=150,
        electricity_price_per_unit=3500,
        water_previous=10,
        water_current=15,
        water_price_per_unit=30000,
        due_date=today,
    )


# ============ Auth Fixtures ============

@pytest.fixture
def admin_tokens(admin_client):
    """Get JWT tokens for admin user."""
    response = admin_client.post("/api/auth/login/", {
        "username": "admin",
        "password": "admin123",
    })
    return response.data if response.status_code == 200 else None


@pytest.fixture
def landlord_tokens(landlord_client):
    """Get JWT tokens for landlord user."""
    response = landlord_client.post("/api/auth/login/", {
        "username": "landlord",
        "password": "landlord123",
    })
    return response.data if response.status_code == 200 else None


@pytest.fixture
def tenant_tokens(tenant_client):
    """Get JWT tokens for tenant user."""
    response = tenant_client.post("/api/auth/login/", {
        "username": "tenant",
        "password": "tenant123",
    })
    return response.data if response.status_code == 200 else None