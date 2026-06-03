"""
Rutas para la aplicación de usuarios:
- POST /users/register: Registrar un nuevo usuario.
- POST /users/login: Autenticar usuario y obtener token JWT.
- GET /users/me: Obtener información del usuario autenticado.
"""

from django.urls import path
from .views import RegisterView, LoginView, MeView

app_name = "users"

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
]
