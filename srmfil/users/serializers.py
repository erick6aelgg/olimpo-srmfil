from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer para la lectura de la entidad Usuario.
    """
    class Meta:
        """
        Define los campos que se exponen del usuario.
        """
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'apellido_p', 'apellido_m', 'tipo_usuario']


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer de escritura para el registro de nuevos usuarios.
    Se encarga de crear el usuario y hashear la contraseña.
    """

    password = serializers.CharField(write_only=True)

    class Meta:
        """
        Define los campos necesarios para registrar un usuario.
        """
        model = Usuario
        fields = ['email', 'password', 'first_name', 'apellido_p', 'apellido_m', 'tipo_usuario']

    def create(self, validated_data):
        """
        Crea un nuevo usuario y aplica hash a la contraseña antes de guardarla.
        """

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
    """
    Serializer para la autenticación de usuarios.
    Valida email y contraseña para generar token JWT.
    """

    email = serializers.EmailField()
    password = serializers.CharField()