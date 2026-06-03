from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings

from .models import Parque, ImagenParque
from .serializers import (
    ParqueSerializer,
    ParqueDetailSerializer,
    ImagenParqueSerializer,
    ImagenParqueReadSerializer,
)
from services.models import Servicio
from imagekitio.models.UploadFileRequestOptions import UploadFileRequestOptions
from imagekitio import ImageKit
import uuid
from django.shortcuts import get_object_or_404



class ParqueCreateView(APIView):
    """
    POST /parks/create

    Crea un nuevo parque.
    Solo usuarios con rol admin pueden realizar esta acción.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):

        if request.user.tipo_usuario != 'admin':
            return Response({"error": "No autorizado"}, status=403)
        
        serializer = ParqueSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=400)
    

class ParqueListView(APIView):
    """
    GET /parks

    Lista los parques disponibles.
    - Usuarios normales: solo parques activos.
    - Admin: todos los parques.
    """

    permission_classes = [AllowAny]  
    authentication_classes = [JWTAuthentication]  

    def get(self, request):

        user = request.user

        if user.is_authenticated and user.tipo_usuario == 'admin':
            parques = Parque.objects.all().prefetch_related('servicios', 'imagenes')
        else:
            parques = Parque.objects.filter(estatus_parque='activo').prefetch_related('servicios', 'imagenes')

        serializer = ParqueDetailSerializer(parques, many=True)

        return Response(serializer.data)
    

class ParqueDetailView(APIView):
    """
    GET /parks/{id}

    Obtiene el detalle de un parque específico.
    - Si está inactivo, solo admin puede verlo.
    """

    permission_classes = [AllowAny]
    authentication_classes = [JWTAuthentication]

    def get(self, request, id):

        try:
            parque = Parque.objects.prefetch_related('servicios', 'imagenes').get(id=id)
        except Parque.DoesNotExist:
            return Response({"error": "Parque no existe"}, status=404)

        user = request.user

        if parque.estatus_parque != 'activo':
            if not (user.is_authenticated and user.tipo_usuario == 'admin'):
                return Response({"error": "Parque no existe"}, status=403)

        serializer = ParqueDetailSerializer(parque)

        return Response(serializer.data)
    

class ParqueUpdateView(APIView):
    """
    PUT/PATCH /parks/{id}/update

    Actualiza la información de un parque.
    Solo admin puede modificar datos.
    """

    permission_classes = [IsAuthenticated]

    def put(self, request, id):

        if request.user.tipo_usuario != 'admin':
            return Response({"error": "No autorizado"}, status=403)

        try:
            parque = Parque.objects.get(id=id)
        except Parque.DoesNotExist:
            return Response({"error": "Parque no existe"}, status=404)

        serializer = ParqueSerializer(parque, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)


    def patch(self, request, id):

        if request.user.tipo_usuario != 'admin':
            return Response({"error": "No autorizado"}, status=403)

        try:
            parque = Parque.objects.get(id=id)
        except Parque.DoesNotExist:
            return Response({"error": "Parque no existe"}, status=404)

        serializer = ParqueSerializer(parque, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)
    
    
class ParqueDeleteView(APIView):
    """
    DELETE /parks/{id}/delete

    Elimina un parque del sistema.
    Solo admin puede realizar esta acción.
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request, id):

        if request.user.tipo_usuario != 'admin':
            return Response({"error": "No autorizado"}, status=403)

        try:
            parque = Parque.objects.get(id=id)
        except Parque.DoesNotExist:
            return Response({"error": "Parque no existe"}, status=404)

        parque.delete()

        return Response({"message": "Parque eliminado correctamente"}, status=200)
    

class AddServicioToParqueView(APIView):
    """
    POST /parks/{id}/services

    Asocia un servicio a un parque.
    Solo admin puede realizar esta acción.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, id):

        if request.user.tipo_usuario != 'admin':
            return Response({"error": "No autorizado"}, status=403)

        servicio_id = request.data.get('servicio_id')

        if not servicio_id:
            return Response({"error": "servicio_id es requerido"}, status=400)

        try:
            parque = Parque.objects.get(id=id)
        except Parque.DoesNotExist:
            return Response({"error": "Parque no existe"}, status=404)

        try:
            servicio = Servicio.objects.get(id=servicio_id)
        except Servicio.DoesNotExist:
            return Response({"error": "Servicio no existe"}, status=404)

        servicio.parques.add(parque)

        return Response({"message": "Servicio agregado al parque"})
    

class RemoveServicioFromParqueView(APIView):
    """
    DELETE /parks/{id}/services/{service_id}

    Elimina la relación entre un parque y un servicio.
    Solo admin puede realizar esta acción.
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request, id, service_id):

        if request.user.tipo_usuario != 'admin':
            return Response({"error": "No autorizado"}, status=403)

        try:
            parque = Parque.objects.get(id=id)
        except Parque.DoesNotExist:
            return Response({"error": "Parque no existe"}, status=404)

        try:
            servicio = Servicio.objects.get(id=service_id)
        except Servicio.DoesNotExist:
            return Response({"error": "Servicio no existe"}, status=404)

        servicio.parques.remove(parque)

        return Response({"message": "Servicio eliminado del parque"})
    

class ImagenParqueCreateView(APIView):
    """POST creación de imágen"""
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        if request.user.tipo_usuario != 'admin':
            return Response({"error": "No autorizado"}, status=403)

        parque = get_object_or_404(Parque, id=id)

        imagen_file = request.FILES.get('imagen')
        if not imagen_file:
            return Response({"error": "El archivo imagen es requerido."}, status=400)

        es_principal_raw = request.data.get('es_principal', 'false')
        es_principal = es_principal_raw in [True, 'true', 'True', '1']

        if es_principal:
            ImagenParque.objects.filter(parque=parque, es_principal=True).update(es_principal=False)

        imagekit = ImageKit(
            private_key=settings.IMAGEKIT_PRIVATE_KEY,
            public_key=settings.IMAGEKIT_PUBLIC_KEY,
            url_endpoint=settings.IMAGEKIT_URL_ENDPOINT,
        )
        filename = f"parque_{id}_{uuid.uuid4().hex[:8]}"
        options = UploadFileRequestOptions(
            folder="/parques/"
        )

        result = imagekit.file.upload(
            file=imagen_file.read(),
            file_name=filename,
            options=options
        )
        url = result.url

        imagen = ImagenParque.objects.create(
            parque=parque,
            url=url,
            es_principal=es_principal,
        )

        return Response(ImagenParqueReadSerializer(imagen).data, status=status.HTTP_201_CREATED)