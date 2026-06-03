"""
Rutas para la aplicación de reservaciones:
- POST /reservations: Crear una nueva reservación.
- GET /reservations/{id}: Obtener detalles de una reservación específica.
- GET /user/{id}/reservations: Listar todas las reservaciones de un usuario.
- GET /park/{id}/reservations: Listar todas las reservaciones para un parque específico.
- PATCH /reservations/{id}/cancel: Cancelar una reservación existente.
"""

from django.urls import path
from .views import CrearReservacionView, DetalleReservacionView, ReservacionesPorUsuarioView, ReservacionesPorParqueView, CancelarReservacionView

app_name = "reservations"

urlpatterns = [
    path('', CrearReservacionView.as_view(), name='create-reservation'),
    path('<int:id>/', DetalleReservacionView.as_view(), name='reservation-detail'),
    path('<int:id>/cancel/', CancelarReservacionView.as_view(), name='cancel-reservation'),
    path('user/<int:user_id>/', ReservacionesPorUsuarioView.as_view(), name='user-reservations'),
    path('park/<int:park_id>/', ReservacionesPorParqueView.as_view(), name='park-reservations'),
]