from rest_framework import serializers
from .models import Parque
from services.models import Servicio
from services.serializers import ServicioSerializer

class ParqueSerializer(serializers.ModelSerializer):
    """
    Serializer básico para la entidad Parque.
    Utilizado para creación y actualización.
    """
    class Meta:
        """
        Serializa todos los campos del modelo Parque.
        """
        model = Parque
        fields = '__all__'

class ParqueDetailSerializer(serializers.ModelSerializer):
    """
    Serializer de lectura para Parque que incluye los servicios asociados.
    """

    servicios = ServicioSerializer(many=True, read_only=True)

    class Meta:
        """
        Incluye todos los campos del parque junto con sus servicios.
        """
        model = Parque
        fields = '__all__'