from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Reservacion
from .serializer import ReservacionSerializer, CrearReservacionSerializer
from .emails import enviar_confirmacion_reservacion, enviar_notificacion_cancelacion
from users.models import Usuario
from parks.models import Parque


class CrearReservacionView(APIView):
    """
    POST /reservations

    Crea una nueva reservación y envía un correo de confirmación.
    Solo usuarios autenticados.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CrearReservacionSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        reservacion = serializer.save()
        enviar_confirmacion_reservacion(reservacion) 
        return Response(
            ReservacionSerializer(reservacion).data,
            status=status.HTTP_201_CREATED,
        )


class DetalleReservacionView(APIView):
    """
    GET /reservations/{id}

    Retorna el detalle de una reservación por su ID.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        reservacion = get_object_or_404(Reservacion, id=id)
        serializer = ReservacionSerializer(reservacion)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ReservacionesPorUsuarioView(APIView):
    """
    GET /users/{id}/reservations

    Lista todas las reservaciones de un usuario específico.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        get_object_or_404(Usuario, id=user_id)
        reservaciones = Reservacion.objects.filter(usuario_id=user_id)
        serializer = ReservacionSerializer(reservaciones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ReservacionesPorParqueView(APIView):
    """
    GET /parks/{id}/reservations

    Lista todas las reservaciones de un parque específico.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, park_id):
        get_object_or_404(Parque, id=park_id)
        reservaciones = Reservacion.objects.filter(parque_id=park_id)
        serializer = ReservacionSerializer(reservaciones, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CancelarReservacionView(APIView):
    """
    PATCH /reservations/{id}/cancel

    Cancela una reservación cambiando su estado a 'cancelada'.
    Notifica al usuario por correo sobre la cancelación.
    Solo se puede cancelar una reservación que esté activa.
    """

    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        reservacion = get_object_or_404(Reservacion, id=id)

        if reservacion.estado == "cancelada":
            return Response(
                {"error": "La reservación ya se encuentra cancelada."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reservacion.estado = "cancelada"
        reservacion.save()
        enviar_notificacion_cancelacion(reservacion)
        return Response(ReservacionSerializer(reservacion).data, status=status.HTTP_200_OK)