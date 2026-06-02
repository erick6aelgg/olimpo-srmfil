"""
Rutas para la aplicación de parques:
- GET /parks: Listar parques (activos o todos si es admin).
- POST /parks/create: Crear un nuevo parque (solo admin).
- GET /parks/{id}: Obtener detalle de un parque.
- PUT/PATCH /parks/{id}/update: Actualizar parque (solo admin).
- DELETE /parks/{id}/delete: Eliminar parque (solo admin).
- POST /parks/{id}/services: Agregar servicio a parque (solo admin).
- DELETE /parks/{id}/services/{service_id}: Eliminar servicio de parque (solo admin).
- POST /parks/{id}images/: Asociar una imagen a un parque
"""

from django.urls import path
from .views import ParqueCreateView, ParqueListView, ParqueDetailView, ParqueUpdateView, ParqueDeleteView, AddServicioToParqueView, RemoveServicioFromParqueView, ImagenParqueCreateView

app_name = "parks"

urlpatterns = [
    path('', ParqueListView.as_view(), name='list'),
    path('create/', ParqueCreateView.as_view(), name='create'),
    path('<int:id>/', ParqueDetailView.as_view(), name='detail'),
    path('<int:id>/update/', ParqueUpdateView.as_view(), name='update'),
    path('<int:id>/delete/', ParqueDeleteView.as_view(), name='delete'),
    path('<int:id>/services/', AddServicioToParqueView.as_view(), name='add-service'),
    path('<int:id>/services/<int:service_id>/', RemoveServicioFromParqueView.as_view(), name='remove-service'),
    path('<int:id>/images/', ImagenParqueCreateView.as_view(), name='add-image'),
]