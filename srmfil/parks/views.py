from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

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

    def get(self, request):

        parques = Parque.objects.filter(estatus_parque='activo')
        serializer = ParqueSerializer(parques, many=True)
        
        return Response(serializer.data)