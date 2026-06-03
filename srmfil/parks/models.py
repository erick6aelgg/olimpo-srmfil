from django.db import models

class Parque(models.Model):
    nombre = models.CharField(max_length=255)
    direccion = models.TextField()
    latitud = models.DecimalField(max_digits=9, decimal_places=6)
    longitud = models.DecimalField(max_digits=9, decimal_places=6)

    hora_apertura = models.TimeField()
    hora_cierre = models.TimeField()

    tiene_cabanas = models.BooleanField(default=False)
    capacidad_maxima = models.IntegerField()

    ESTATUS = (
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
    )
    estatus_parque = models.CharField(max_length=10, choices=ESTATUS)

    def __str__(self):
        return self.nombre


class ImagenParque(models.Model):
    parque = models.ForeignKey(Parque, on_delete=models.CASCADE, related_name='imagenes')
    url = models.URLField()
    es_principal = models.BooleanField(default=False)

    def __str__(self):
        return f"Imagen de {self.parque.nombre}"