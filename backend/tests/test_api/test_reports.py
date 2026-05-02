"""
Tests for report and dashboard endpoints.
"""
import pytest


@pytest.mark.django_db
class TestReports:
    def test_revenue_report_as_landlord(self, landlord_client, bill):
        bill.status = "PAID"
        bill.save()

        response = landlord_client.get("/api/reports/revenue/")

        assert response.status_code == 200
        assert response.data["paid_bills"] == 1
        assert "total_revenue" in response.data

    def test_occupancy_report_as_landlord(self, landlord_client, room):
        response = landlord_client.get("/api/reports/occupancy/")

        assert response.status_code == 200
        assert response.data["total_rooms"] == 1
        assert response.data["available_rooms"] == 1

    def test_dashboard_summary_as_admin(self, admin_client, room, tenant, contract, bill):
        response = admin_client.get("/api/dashboard/summary/")

        assert response.status_code == 200
        assert response.data["rooms"] == 1
        assert response.data["tenants"] == 1
        assert response.data["active_contracts"] == 1
