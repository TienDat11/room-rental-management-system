from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _


class Bill(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", _("Pending")
        PAID = "PAID", _("Paid")
        OVERDUE = "OVERDUE", _("Overdue")

    contract = models.ForeignKey("contracts.Contract", on_delete=models.CASCADE, related_name="bills")
    room = models.ForeignKey("rooms.Room", on_delete=models.CASCADE, related_name="bills")
    tenant = models.ForeignKey("tenants.Tenant", on_delete=models.CASCADE, related_name="bills")
    bill_month = models.IntegerField(_("bill month"), db_index=True, validators=[MinValueValidator(1)])
    bill_year = models.IntegerField(_("bill year"), db_index=True, validators=[MinValueValidator(2000)])
    room_price = models.DecimalField(_("room price"), max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    electricity_previous = models.DecimalField(_("electricity previous"), max_digits=10, decimal_places=1, default=0, help_text=_("Previous reading"), validators=[MinValueValidator(0)])
    electricity_current = models.DecimalField(_("electricity current"), max_digits=10, decimal_places=1, default=0, help_text=_("Current reading"), validators=[MinValueValidator(0)])
    electricity_price_per_unit = models.DecimalField(_("electricity price per unit"), max_digits=10, decimal_places=2, default=3500, validators=[MinValueValidator(0)])
    water_previous = models.DecimalField(_("water previous"), max_digits=10, decimal_places=1, default=0, validators=[MinValueValidator(0)])
    water_current = models.DecimalField(_("water current"), max_digits=10, decimal_places=1, default=0, validators=[MinValueValidator(0)])
    water_price_per_unit = models.DecimalField(_("water price per unit"), max_digits=10, decimal_places=2, default=30000, validators=[MinValueValidator(0)])
    other_fees = models.DecimalField(_("other fees"), max_digits=12, decimal_places=2, default=0, help_text=_("Internet, parking, etc."), validators=[MinValueValidator(0)])
    other_fees_description = models.TextField(_("other fees description"), blank=True)
    total_amount = models.DecimalField(_("total amount"), max_digits=12, decimal_places=2, default=0)
    status = models.CharField(_("status"), max_length=10, choices=Status.choices, default=Status.PENDING, db_index=True)
    due_date = models.DateField(_("due date"), db_index=True)
    paid_date = models.DateField(_("paid date"), null=True, blank=True)
    notes = models.TextField(_("notes"), blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-bill_year", "-bill_month"]
        verbose_name = _("Bill")
        verbose_name_plural = _("Bills")
        unique_together = ["room", "bill_month", "bill_year"]

    def __str__(self):
        return f"Bill {self.bill_month}/{self.bill_year} - Room {self.room.room_number}"

    def save(self, *args, **kwargs):
        electricity_usage = self.electricity_current - self.electricity_previous
        electricity_cost = electricity_usage * self.electricity_price_per_unit
        water_usage = self.water_current - self.water_previous
        water_cost = water_usage * self.water_price_per_unit
        self.total_amount = self.room_price + electricity_cost + water_cost + self.other_fees
        super().save(*args, **kwargs)


class Payment(models.Model):
    class Method(models.TextChoices):
        CASH = "CASH", _("Cash")
        TRANSFER = "TRANSFER", _("Bank Transfer")

    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(_("amount"), max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    payment_method = models.CharField(_("payment method"), max_length=10, choices=Method.choices, default=Method.CASH)
    payment_date = models.DateField(_("payment date"))
    notes = models.TextField(_("notes"), blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-payment_date"]
        verbose_name = _("Payment")
        verbose_name_plural = _("Payments")

    def __str__(self):
        return f"Payment {self.amount} for Bill {self.bill.id}"


class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(_("action"), max_length=50)
    entity_type = models.CharField(_("entity type"), max_length=50)
    entity_id = models.IntegerField(_("entity ID"))
    old_values = models.JSONField(_("old values"), null=True, blank=True)
    new_values = models.JSONField(_("new values"), null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("Audit Log")
        verbose_name_plural = _("Audit Logs")

    def __str__(self):
        return f"{self.action} {self.entity_type}#{self.entity_id} by {self.user}"
