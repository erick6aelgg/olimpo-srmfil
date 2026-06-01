from django.test import TestCase, override_settings
from django.urls import reverse
from django.core import mail
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta

from users.models import Usuario
from parks.models import Parque
from .models import Reservacion


class BaseReservacionTestCase(TestCase):
    """
    Clase base con el setup compartido por todos los test cases.
    Crea un usuario, un parque y un cliente autenticado.
    """

    def setUp(self):
        self.client = APIClient()

        self.usuario = Usuario.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="password123",
            apellido_p="Apellidop",
            apellido_m="Apellidom",
            tipo_usuario="cliente",
        )

        self.otro_usuario = Usuario.objects.create_user(
            username="otrouser",
            email="otro@example.com",
            password="password123",
            apellido_p="Apellidop2",
            apellido_m="Apellidom2",
            tipo_usuario="cliente",
        )

        self.parque = Parque.objects.create(
            nombre="Parque Test",
            direccion="Calle Test 123",
            latitud=19.420412,
            longitud=-99.194166,
            hora_apertura="06:00:00",
            hora_cierre="18:00:00",
            tiene_cabanas=True,
            capacidad_maxima=100,
            estatus_parque="activo",
        )

        # Fechas reutilizables
        self.fecha_inicio = date.today() + timedelta(days=10)
        self.fecha_fin = date.today() + timedelta(days=15)

        # Autenticar el cliente por defecto 
        self.client.force_authenticate(user=self.usuario)

    def _crear_reservacion(self, usuario=None, estado="activa"):
        """Helper para crear una reservación directamente en la BD."""
        return Reservacion.objects.create(
            usuario=usuario or self.usuario,
            parque=self.parque,
            fecha_inicio=self.fecha_inicio,
            fecha_fin=self.fecha_fin,
            numero_personas=2,
            tipo_visita="camping",
            estado=estado,
        )


#POST crear reservaciones
@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class CrearReservacionTests(BaseReservacionTestCase):

    def setUp(self):
        super().setUp()
        self.url = reverse("reservations:create-reservation")
        self.payload_valido = {
            "usuario": self.usuario.id,
            "parque": self.parque.id,
            "fecha_inicio": str(self.fecha_inicio),
            "fecha_fin": str(self.fecha_fin),
            "numero_personas": 3,
            "tipo_visita": "camping",
        }

    def test_crear_reservacion_exitosa(self):
        response = self.client.post(self.url, self.payload_valido, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Reservacion.objects.count(), 1)
        self.assertEqual(response.data["estado"], "activa")
        self.assertEqual(response.data["tipo_visita"], "camping")

    def test_crear_reservacion_sin_autenticacion(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url, self.payload_valido, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_crear_reservacion_fechas_invalidas(self):
        """fecha_fin anterior a fecha_inicio debe fallar."""
        payload = {**self.payload_valido, "fecha_fin": str(self.fecha_inicio - timedelta(days=1))}
        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("fecha_fin", response.data)

    def test_crear_reservacion_misma_fecha(self):
        """fecha_fin igual a fecha_inicio debe fallar."""
        payload = {**self.payload_valido, "fecha_fin": str(self.fecha_inicio)}
        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_crear_reservacion_campo_faltante(self):
        """Omitir un campo requerido debe fallar."""
        payload = {**self.payload_valido}
        del payload["numero_personas"]
        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("numero_personas", response.data)

    def test_crear_reservacion_tipo_visita_invalido(self):
        payload = {**self.payload_valido, "tipo_visita": "picnic"}
        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_crear_reservacion_excede_capacidad(self):
        """numero_personas mayor a capacidad_maxima debe fallar."""
        payload = {**self.payload_valido, "numero_personas": self.parque.capacidad_maxima + 1}
        response = self.client.post(self.url, payload, format="json")
    
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("numero_personas", response.data)

    def test_crear_reservacion_cabana_sin_cabanas(self):
        """Reservar cabaña en parque sin cabañas debe fallar."""
        self.parque.tiene_cabanas = False
        self.parque.save()

        payload = {**self.payload_valido, "tipo_visita": "cabana"}
        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("tipo_visita", response.data)
    
    def test_crear_reservacion_envia_correo(self):
        response = self.client.post(self.url, self.payload_valido, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Confirmación", mail.outbox[0].subject)
        self.assertEqual(mail.outbox[0].to, [self.usuario.email])

#GET datos de reservación
class DetalleReservacionTests(BaseReservacionTestCase):

    def test_obtener_reservacion_existente(self):
        reservacion = self._crear_reservacion()
        url = reverse("reservations:reservation-detail", args=[reservacion.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], reservacion.id)

    def test_obtener_reservacion_inexistente(self):
        url = reverse("reservations:reservation-detail", args=[9999])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_obtener_reservacion_sin_autenticacion(self):
        reservacion = self._crear_reservacion()
        self.client.force_authenticate(user=None)
        url = reverse("reservations:reservation-detail", args=[reservacion.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# GET datos reservación por usuario
class ReservacionesPorUsuarioTests(BaseReservacionTestCase):

    def test_lista_reservaciones_de_usuario(self):
        self._crear_reservacion()
        self._crear_reservacion()
        url = reverse("reservations:user-reservations", args=[self.usuario.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_lista_vacia_si_usuario_sin_reservaciones(self):
        url = reverse("reservations:user-reservations", args=[self.otro_usuario.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_no_retorna_reservaciones_de_otro_usuario(self):
        """Las reservaciones del otro usuario no deben aparecer."""
        self._crear_reservacion(usuario=self.otro_usuario)
        url = reverse("reservations:user-reservations", args=[self.usuario.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_usuario_inexistente_retorna_404(self):
        url = reverse("reservations:user-reservations", args=[9999])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# GET datos reservación por parque
class ReservacionesPorParqueTests(BaseReservacionTestCase):

    def test_lista_reservaciones_de_parque(self):
        self._crear_reservacion()
        self._crear_reservacion()
        url = reverse("reservations:park-reservations", args=[self.parque.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_parque_inexistente_retorna_404(self):
        url = reverse("reservations:park-reservations", args=[9999])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_lista_vacia_si_parque_sin_reservaciones(self):
        otro_parque = Parque.objects.create(
            nombre="Parque Vacío",
            direccion="Sin reservas 0",
            latitud=19.0,
            longitud=-99.0,
            hora_apertura="08:00:00",
            hora_cierre="17:00:00",
            tiene_cabanas=False,
            capacidad_maxima=50,
            estatus_parque="activo",
        )
        url = reverse("reservations:park-reservations", args=[otro_parque.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)


# PATCH cancelar reservaciones
class CancelarReservacionTests(BaseReservacionTestCase):

    def test_cancelar_reservacion_activa(self):
        reservacion = self._crear_reservacion(estado="activa")
        url = reverse("reservations:cancel-reservation", args=[reservacion.id])
        response = self.client.patch(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["estado"], "cancelada")

        # Verificar que persiste en la BD
        reservacion.refresh_from_db()
        self.assertEqual(reservacion.estado, "cancelada")

    def test_cancelar_reservacion_ya_cancelada(self):
        reservacion = self._crear_reservacion(estado="cancelada")
        url = reverse("reservations:cancel-reservation", args=[reservacion.id])
        response = self.client.patch(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_cancelar_reservacion_inexistente(self):
        url = reverse("reservations:cancel-reservation", args=[9999])
        response = self.client.patch(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cancelar_sin_autenticacion(self):
        reservacion = self._crear_reservacion()
        self.client.force_authenticate(user=None)
        url = reverse("reservations:cancel-reservation", args=[reservacion.id])
        response = self.client.patch(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
