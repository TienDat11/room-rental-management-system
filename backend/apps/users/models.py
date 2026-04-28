from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", _("Admin")
        LANDLORD = "LANDLORD", _("Landlord")
        TENANT = "TENANT", _("Tenant")

    full_name = models.CharField(_("full name"), max_length=150, blank=True)
    email = models.EmailField(_("email address"), unique=True)
    phone = models.CharField(_("phone number"), max_length=20, blank=True)
    role = models.CharField(_("role"), max_length=10, choices=Role.choices, default=Role.TENANT)

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_landlord(self):
        return self.role == self.Role.LANDLORD

    @property
    def is_tenant(self):
        return self.role == self.Role.TENANT