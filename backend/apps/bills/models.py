from django.db import models
from django.conf import settings


class Bill(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PAID = "PAID", "Paid"
        OVERDUE = "OVERDUE", "Overdue"

    contract = models.ForeignKey("contracts.Contract", on_delete=models.CASCADE, related_name="bills")
    room = models.ForeignKey("rooms.Room", on_delete=models.CASCADE, related_name="bills")
    tenant = models.ForeignKey("tenants.Tenant", on_delete=models.CASCADE, related_name="bills")
    bill_month = models.IntegerField()
    bill_year = models.IntegerField()
    room_price = models.DecimalField(max_digits=10, decimal_places=2)
    electricity_previous = models.DecimalField(max_digits=10, decimal_places=1, default=0, help_text="Previous reading")
    electricity_current = models.DecimalField(max_digits=10, decimal_places=1, default=0, help_text="Current reading")
    electricity_price_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=3500)
    water_previous = models.DecimalField(max_digits=10, decimal_places=1, default=0)
    water_current = models.DecimalField(max_digits=10, decimal_places=1, default=0)
    water_price_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=30000)
    other_fees = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Internet, parking, etc.")
    other_fees_description = models.TextField(blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    due_date = models.DateField()
    paid_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-bill_year", "-bill_month"]
        verbose_name = "Bill"
        verbose_name_plural = "Bills"
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
        CASH = "CASH", "Cash"
        TRANSFER = "TRANSFER", "Bank Transfer"

    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=Method.choices, default=Method.CASH)
    payment_date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-payment_date"]
        verbose_name = "Payment"
        verbose_name_plural = "Payments"

    def __str__(self):
        return f"Payment {self.amount} for Bill {self.bill.id}"


class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50)
    entity_type = models.CharField(max_length=50)
    entity_id = models.IntegerField()
    old_values = models.JSONField(null=True, blank=True)
    new_values = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"

    def __str__(self):
        return f"{self.action} {self.entity_type}#{self.entity_id} by {self.user}"
