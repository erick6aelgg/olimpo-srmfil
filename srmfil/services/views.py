from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Servicio
from .serializers import ServicioSerializer

class ServicioCreateView(APIView):
    """
    POST /services/create

    Crea un nuevo servicio.
    Solo admin puede realizar esta acción.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):

        if request.user.tipo_usuario != 'admin':
            return Response({"error": "No autorizado"}, status=403)

        serializer = ServicioSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=400)
    

class ServicioListView(APIView):
    """
    GET /services

    Lista todos los servicios disponibles.
    """

    permission_classes = [AllowAny]
    authentication_classes = [JWTAuthentication]

    def get(self, request):

        servicios = Servicio.objects.all()
        serializer = ServicioSerializer(servicios, many=True)
        return Response(serializer.data)


class ServicioUpdateView(APIView):
    """
    PATCH /services/{id}/update

    Actualiza un servicio existente.
    Solo admin puede modificarlo.
    """

    permission_classes = [IsAuthenticated]

    def patch(self, request, id):

        if request.user.tipo_usuario != 'admin':
            return Response({"error": "No autorizado"}, status=403)

        try:
            servicio = Servicio.objects.get(id=id)
        except Servicio.DoesNotExist:
            return Response({"error": "Servicio no existe"}, status=404)

        serializer = ServicioSerializer(servicio, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)
    

class ServicioDeleteView(APIView):
    """
    DELETE /services/{id}/delete

    Elimina un servicio del sistema.
    También elimina automáticamente sus relaciones con parques.
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request, id):

        if request.user.tipo_usuario != 'admin':
            return Response({"error": "No autorizado"}, status=403)

        try:
            servicio = Servicio.objects.get(id=id)
        except Servicio.DoesNotExist:
            return Response({"error": "Servicio no existe"}, status=404)

        servicio.delete()

        return Response({"message": "Servicio eliminado correctamente"})