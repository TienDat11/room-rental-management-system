from django.db import models
from django.conf import settings
from django.core.validators import MinLengthValidator
from django.utils.translation import gettext_lazy as _


class Tenant(models.Model):
    full_name = models.CharField(_("full name"), max_length=100)
    id_card = models.CharField(_("ID card"), max_length=20, unique=True, help_text=_("CMND/CCCD"), validators=[MinLengthValidator(9)])
    phone = models.CharField(_("phone number"), max_length=15, db_index=True)
    email = models.EmailField(_("email"), blank=True)
    date_of_birth = models.DateField(_("date of birth"), null=True, blank=True)
    address = models.TextField(_("address"), blank=True)
    emergency_contact = models.CharField(_("emergency contact"), max_length=100, blank=True)
    room = models.OneToOneField("rooms.Room", on_delete=models.SET_NULL, null=True, blank=True, related_name="tenant")
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="tenant_profile")
    status = models.CharField(_("status"), max_length=10, choices=[("ACTIVE", _("Active")), ("INACTIVE", _("Inactive"))], default="ACTIVE", db_index=True)
    notes = models.TextField(_("notes"), blank=True)
    landlord = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tenants")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("Tenant")
        verbose_name_plural = _("Tenants")

    def __str__(self):
        return f"{self.full_name} - {self.id_card}"
