from django.db import models
from users.models import Usuario
from parks.models import Parque

class Reservacion(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='reservaciones')
    parque = models.ForeignKey(Parque, on_delete=models.CASCADE, related_name='reservaciones')

    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    numero_personas = models.IntegerField()

    TIPO_VISITA = (
        ('cabana', 'Cabaña'),
        ('camping', 'Camping'),
    )
    tipo_visita = models.CharField(max_length=10, choices=TIPO_VISITA)

    ESTADO = (
        ('activa', 'Activa'),
        ('cancelada', 'Cancelada'),
    )
    estado = models.CharField(max_length=10, choices=ESTADO, default='activa')

    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reserva {self.id} - {self.usuario.email}"
    
    class Meta:
        verbose_name = "Reservación"
        verbose_name_plural = "Reservaciones"