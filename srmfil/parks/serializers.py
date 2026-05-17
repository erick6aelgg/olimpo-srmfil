from rest_framework import serializers
from .models import Parque
from services.models import Servicio
from services.serializers import ServicioSerializer

class ParqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parque
        fields = '__all__'

class ParqueDetailSerializer(serializers.ModelSerializer):

    servicios = ServicioSerializer(many=True, read_only=True)

    class Meta:
        model = Parque
        fields = '__all__'