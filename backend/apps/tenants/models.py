from django.db import models
from django.conf import settings


class Tenant(models.Model):
    full_name = models.CharField(max_length=150)
    id_card = models.CharField(max_length=20, unique=True, help_text="CMND/CCCD")
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=150, blank=True)
    room = models.OneToOneField("rooms.Room", on_delete=models.SET_NULL, null=True, blank=True, related_name="tenant")
    status = models.CharField(max_length=10, choices=[("ACTIVE", "Active"), ("INACTIVE", "Inactive")], default="ACTIVE")
    notes = models.TextField(blank=True)
    landlord = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tenants")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Tenant"
        verbose_name_plural = "Tenants"

    def __str__(self):
        return f"{self.full_name} - {self.id_card}"
