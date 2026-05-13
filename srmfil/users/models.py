from django.db import models
from django.contrib.auth.models import AbstractUser

class Usuario(AbstractUser):
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