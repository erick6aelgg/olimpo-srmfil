from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('tipo_usuario', 'admin')
        return self.create_user(email, password, **extra_fields)

class Usuario(AbstractUser):
    objects = UsuarioManager()

    email = models.EmailField(unique=True)
    apellido_p = models.CharField(max_length=100)
    apellido_m = models.CharField(max_length=100)

    TIPO_USUARIO = (
        ('cliente', 'Cliente'),
        ('admin', 'Admin'),
    )
    tipo_usuario = models.CharField(max_length=10, choices=TIPO_USUARIO)

    def __str__(self):
        return self.email