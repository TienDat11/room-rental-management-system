from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _


class Contract(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", _("Active")
        EXPIRED = "EXPIRED", _("Expired")
        TERMINATED = "TERMINATED", _("Terminated")

    tenant = models.ForeignKey("tenants.Tenant", on_delete=models.CASCADE, related_name="contracts")
    room = models.ForeignKey("rooms.Room", on_delete=models.CASCADE, related_name="contracts")
    landlord = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="contracts")
    start_date = models.DateField(_("start date"), db_index=True)
    end_date = models.DateField(_("end date"), db_index=True)
    deposit_amount = models.DecimalField(_("deposit amount"), max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    monthly_rent = models.DecimalField(_("monthly rent"), max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    status = models.CharField(_("status"), max_length=15, choices=Status.choices, default=Status.ACTIVE, db_index=True)
    terms = models.TextField(_("terms"), blank=True, help_text=_("Contract terms and conditions"))
    notes = models.TextField(_("notes"), blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("Contract")
        verbose_name_plural = _("Contracts")

    def __str__(self):
        return f"Contract {self.id} - {self.tenant.full_name} - Room {self.room.room_number}"
