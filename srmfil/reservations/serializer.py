from rest_framework import serializers
from .models import Reservacion
from parks.models import Parque
from users.models import Usuario


class ReservacionSerializer(serializers.ModelSerializer):
    """
    Serializer para la lectura de la entidad Reservacion.
    """
    parque_nombre = serializers.CharField(source='parque.nombre', read_only=True)
    usuario_email = serializers.CharField(source='usuario.email', read_only=True)

    class Meta:
        """
        Define los campos que se van a serializar y cuáles son de solo lectura.
        """
        model = Reservacion
        fields = [
            'id', 'usuario', 'parque', 'fecha_inicio', 'fecha_fin',
            'numero_personas', 'tipo_visita', 'estado', 'fecha_creacion',
            'parque_nombre', 'usuario_email'
        ]
        read_only_fields = ['id', 'estado', 'fecha_creacion', 'usuario']

class CrearReservacionSerializer(serializers.ModelSerializer):
    """Serializer de escritura para crear una Reservacion."""

    class Meta:
        model = Reservacion
        fields = [
            "usuario", "parque", "fecha_inicio",
            "fecha_fin", "numero_personas", "tipo_visita",
        ]

    def validate(self, data):
        """
        Validaciones personalizadas para la creación de una reservación.
        Verifica:
        - Que fecha_fin sea posterior a fecha_inicio.
        - Capacidad máxima del parque no sea excedida por numero_personas.
        - Que si tipo_visita es 'cabana', el parque realmente tenga cabañas.
        """

        if data["fecha_fin"] <= data["fecha_inicio"]:
            raise serializers.ValidationError(
                {"fecha_fin": "La fecha de fin debe ser posterior a la fecha de inicio."}
            )

        parque = data["parque"]

        if data["numero_personas"] > parque.capacidad_maxima:
            raise serializers.ValidationError(
                {"numero_personas": f"El parque solo admite hasta {parque.capacidad_maxima} personas."}
            )

        if data["tipo_visita"] == "cabana" and not parque.tiene_cabanas:
            raise serializers.ValidationError(
                {"tipo_visita": "Este parque no tiene cabañas disponibles."}
            )

        return data