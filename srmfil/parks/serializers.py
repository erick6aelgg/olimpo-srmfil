from rest_framework import serializers
from .models import Parque

class ParqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parque
        fields = '__all__'