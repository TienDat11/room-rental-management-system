from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _


class Room(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "AVAILABLE", _("Available")
        OCCUPIED = "OCCUPIED", _("Occupied")
        MAINTENANCE = "MAINTENANCE", _("Maintenance")

    room_number = models.CharField(_("room number"), max_length=20, unique=True, db_index=True)
    floor = models.IntegerField(_("floor"), default=1, db_index=True, validators=[MinValueValidator(1)])
    area = models.DecimalField(_("area"), max_digits=8, decimal_places=2, help_text=_("Area in square meters"), validators=[MinValueValidator(1)])
    base_price = models.DecimalField(_("base price"), max_digits=12, decimal_places=2, help_text=_("Monthly rent price"), validators=[MinValueValidator(0)])
    status = models.CharField(_("status"), max_length=15, choices=Status.choices, default=Status.AVAILABLE, db_index=True)
    amenities = models.TextField(_("amenities"), blank=True, help_text=_("Comma-separated amenities"))
    description = models.TextField(_("description"), blank=True)
    landlord = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="rooms")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["floor", "room_number"]
        verbose_name = "Room"
        verbose_name_plural = "Rooms"

    def __str__(self):
        return f"Room {self.room_number} (Floor {self.floor})"


class RoomImage(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="rooms/")
    caption = models.CharField(_("caption"), max_length=200, blank=True)
    is_primary = models.BooleanField(_("is primary"), default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_primary", "created_at"]

    def __str__(self):
        return f"Image for {self.room.room_number}"
