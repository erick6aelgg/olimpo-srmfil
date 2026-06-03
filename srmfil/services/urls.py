"""
Rutas para la aplicación de servicios:
- GET /services: Listar todos los servicios.
- POST /services/create: Crear un nuevo servicio (solo admin).
- PATCH /services/{id}/update: Actualizar servicio (solo admin).
- DELETE /services/{id}/delete: Eliminar servicio (solo admin).
"""

from django.urls import path
from .views import ServicioCreateView, ServicioListView, ServicioUpdateView, ServicioDeleteView

app_name = "services"

urlpatterns = [
    path('', ServicioListView.as_view(), name='list'),
    path('create/', ServicioCreateView.as_view(), name='create'),
    path('<int:id>/update/', ServicioUpdateView.as_view(), name='update'),
    path('<int:id>/delete/', ServicioDeleteView.as_view(), name='delete'),
]