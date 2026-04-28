from django.db import models
from django.conf import settings


class Contract(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        EXPIRED = "EXPIRED", "Expired"
        TERMINATED = "TERMINATED", "Terminated"

    tenant = models.ForeignKey("tenants.Tenant", on_delete=models.CASCADE, related_name="contracts")
    room = models.ForeignKey("rooms.Room", on_delete=models.CASCADE, related_name="contracts")
    landlord = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="contracts")
    start_date = models.DateField()
    end_date = models.DateField()
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.ACTIVE)
    terms = models.TextField(blank=True, help_text="Contract terms and conditions")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Contract"
        verbose_name_plural = "Contracts"

    def __str__(self):
        return f"Contract {self.id} - {self.tenant.full_name} - Room {self.room.room_number}"
