from rest_framework import serializers
from .models import Servicio

class ServicioSerializer(serializers.ModelSerializer):
    """
    Serializer para la entidad Servicio.
    Utilizado para lectura y escritura de servicios.
    """

    class Meta:
        """
        Define los campos básicos de un servicio.
        """
        model = Servicio
        fields = ['id', 'nombre', 'descripcion']  