from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'apellido_p', 'apellido_m', 'tipo_usuario']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['email', 'password', 'first_name', 'apellido_p', 'apellido_m', 'tipo_usuario']

    def create(self, validated_data):
        user = Usuario(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            apellido_p=validated_data['apellido_p'],
            apellido_m=validated_data['apellido_m'],
            tipo_usuario=validated_data['tipo_usuario']
        )
        user.set_password(validated_data['password']) 
        user.save()
        return user
    

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()