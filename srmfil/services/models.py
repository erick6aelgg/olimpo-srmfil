from django.db import models
from parks.models import Parque

class Servicio(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()

    parques = models.ManyToManyField(Parque, related_name='servicios')

    def __str__(self):
        return self.nombre