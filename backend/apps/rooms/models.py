from django.db import models
from django.conf import settings


class Room(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Available"
        OCCUPIED = "OCCUPIED", "Occupied"
        MAINTENANCE = "MAINTENANCE", "Maintenance"

    room_number = models.CharField(max_length=20, unique=True)
    floor = models.IntegerField(default=1)
    area = models.FloatField(help_text="Area in square meters")
    base_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Monthly rent price")
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.AVAILABLE)
    amenities = models.TextField(blank=True, help_text="Comma-separated amenities")
    description = models.TextField(blank=True)
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
    caption = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_primary", "created_at"]

    def __str__(self):
        return f"Image for {self.room.room_number}"
