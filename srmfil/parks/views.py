from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Parque
from .serializers import ParqueSerializer

class ParqueCreateView(APIView):

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

    permission_classes = [AllowAny]  
    authentication_classes = [JWTAuthentication]  

    def get(self, request):

        user = request.user

        if user.is_authenticated and user.tipo_usuario == 'admin':
            parques = Parque.objects.all()
        else:
            parques = Parque.objects.filter(estatus_parque='activo')

        serializer = ParqueSerializer(parques, many=True)

        return Response(serializer.data)
    

class ParqueDetailView(APIView):

    permission_classes = [AllowAny]
    authentication_classes = [JWTAuthentication]

    def get(self, request, id):

        try:
            parque = Parque.objects.get(id=id)
        except Parque.DoesNotExist:
            return Response({"error": "Parque no existe"}, status=404)

        user = request.user

        if parque.estatus_parque != 'activo':
            if not (user.is_authenticated and user.tipo_usuario == 'admin'):
                return Response({"error": "Parque no existe"}, status=403)

        serializer = ParqueSerializer(parque)

        return Response(serializer.data)
    

class ParqueUpdateView(APIView):

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