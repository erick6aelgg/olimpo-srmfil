from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta
from unittest.mock import patch
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
import io

from users.models import Usuario
from .models import Parque, ImagenParque


class BaseParquesTestCase(TestCase):
    """
    Clase base con el setup compartido por todos los test cases.
    Crea un usuario, un parque y un cliente autenticado.
    """

    def setUp(self):
        self.client = APIClient()

        self.admin = Usuario.objects.create_user(
            username="adminuser",
            email="admin@example.com",
            password="password123",
            apellido_p="Apellidop",
            apellido_m="Apellidom",
            tipo_usuario="admin",
        )
        self.usuario = Usuario.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="password123",
            apellido_p="Apellidop",
            apellido_m="Apellidom",
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
        self.payload_valido = {
            "nombre": "Parque Nuevo",
            "direccion": "Av. Siempre Viva 742",
            "latitud": "19.432608",
            "longitud": "-99.133209",
            "hora_apertura": "07:00:00",
            "hora_cierre": "20:00:00",
            "tiene_cabanas": False,
            "capacidad_maxima": 50,
            "estatus_parque": "activo",
        }

        # Fechas reutilizables
        self.fecha_inicio = date.today() + timedelta(days=10)
        self.fecha_fin = date.today() + timedelta(days=15)

        # Imágenes para testeo con parques
        self.imagen = ImagenParque.objects.create(
            parque=self.parque,
            url="https://imagekit.io/imagen.jpg",
            es_principal=False,
        )
        self.imagen_file = SimpleUploadedFile(
            "foto.jpg", b"contenido_imagen", content_type="image/jpeg"
        )

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
    
class ParqueCreateViewTestCase(BaseParquesTestCase):
    #POST creación de parques 
        
    def test_crear_parque_sin_autenticacion_retorna_401(self):
        """Un request sin token debe ser rechazado."""
        response = self.client.post(reverse("parks:create"), self.payload_valido, format="json")
        self.assertEqual(response.status_code, 401)

    def test_crear_parque_como_cliente_retorna_403(self):
        """Un usuario con rol 'cliente' no puede crear parques."""
        self.client.force_authenticate(user=self.usuario)
        response = self.client.post(reverse("parks:create"), self.payload_valido, format="json")
        self.assertEqual(response.status_code, 403)
        self.assertIn("error", response.data)

    def test_crear_parque_como_admin_retorna_201(self):
        """Un usuario admin puede crear un parque exitosamente."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(reverse("parks:create"), self.payload_valido, format="json")
        self.assertEqual(response.status_code, 201)

    def test_crear_parque_persiste_en_base_de_datos(self):
        """El parque creado debe existir en la BD después del request."""
        self.client.force_authenticate(user=self.admin)
        self.client.post(reverse("parks:create"), self.payload_valido, format="json")
        existe = Parque.objects.filter(nombre="Parque Nuevo").exists()
        self.assertTrue(existe)

    def test_crear_parque_con_payload_vacio_retorna_400(self):
        """Un body vacío debe retornar errores de validación."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(reverse("parks:create"), {}, format="json")
        self.assertEqual(response.status_code, 400)

class ParqueListViewTestCase(BaseParquesTestCase):
    #GET info de parques

    def setUp(self):
        super().setUp()
        #Un parque inactivo 
        self.parque_inactivo = Parque.objects.create(
            nombre="Parque Inactivo",
            direccion="Calle Inactiva 456",
            latitud=19.500000,
            longitud=-99.200000,
            hora_apertura="06:00:00",
            hora_cierre="18:00:00",
            tiene_cabanas=False,
            capacidad_maxima=50,
            estatus_parque="inactivo",
        )
    
    def test_listar_parques_sin_autenticacion_retorna_200(self):
        """El endpoint es público, no requiere token."""
        response = self.client.get(reverse("parks:list"))
        self.assertEqual(response.status_code, 200)

    def test_listar_parques_sin_autenticacion_solo_retorna_activos(self):
        """Un visitante anónimo solo debe ver parques activos."""
        response = self.client.get(reverse("parks:list"))
        nombres = [p["nombre"] for p in response.data]
        self.assertIn("Parque Test", nombres)
        self.assertNotIn("Parque Inactivo", nombres)

    def test_listar_parques_como_cliente_retorna_200(self):
        """Un cliente autenticado puede acceder al listado."""
        self.client.force_authenticate(user=self.usuario)
        response = self.client.get(reverse("parks:list"))
        self.assertEqual(response.status_code, 200)

    def test_listar_parques_como_cliente_solo_retorna_activos(self):
        """Un cliente autenticado no debe ver parques inactivos."""
        self.client.force_authenticate(user=self.usuario)
        response = self.client.get(reverse("parks:list"))
        nombres = [p["nombre"] for p in response.data]
        self.assertIn("Parque Test", nombres)
        self.assertNotIn("Parque Inactivo", nombres)

    def test_listar_parques_como_admin_retorna_conteo_total(self):
        """El admin debe ver todos los parques existentes en BD."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("parks:list"))
        self.assertEqual(len(response.data), Parque.objects.count())

class ParqueUpdateViewTestCase(BaseParquesTestCase):
    #PUT y PATCH 
    def test_put_sin_autenticacion_retorna_401(self):
        """PUT sin token debe ser rechazado."""
        response = self.client.put(
            reverse("parks:update", kwargs={"id": self.parque.id}),
            self.payload_valido,
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    def test_put_como_cliente_retorna_403(self):
        """Un cliente no puede actualizar un parque."""
        self.client.force_authenticate(user=self.usuario)
        response = self.client.put(
            reverse("parks:update", kwargs={"id": self.parque.id}),
            self.payload_valido,
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("error", response.data)

    def test_put_como_admin_retorna_200(self):
        """Un admin puede actualizar un parque con PUT."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.put(
            reverse("parks:update", kwargs={"id": self.parque.id}),
            self.payload_valido,
            format="json",
        )
        self.assertEqual(response.status_code, 200)

    def test_put_parque_inexistente_retorna_404(self):
        """PUT sobre un id que no existe debe retornar 404."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.put(
            reverse("parks:update", kwargs={"id": 99999}),
            self.payload_valido,
            format="json",
        )
        self.assertEqual(response.status_code, 404)
        self.assertIn("error", response.data)

    def test_patch_sin_autenticacion_retorna_401(self):
        """PATCH sin token debe ser rechazado."""
        response = self.client.patch(
            reverse("parks:update", kwargs={"id": self.parque.id}),
            {"nombre": "Parcial"},
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    def test_patch_como_cliente_retorna_403(self):
        """Un cliente no puede hacer PATCH sobre un parque."""
        self.client.force_authenticate(user=self.usuario)
        response = self.client.patch(
            reverse("parks:update", kwargs={"id": self.parque.id}),
            {"nombre": "Parcial"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("error", response.data)

    def test_patch_como_admin_retorna_200(self):
        """Un admin puede hacer PATCH sobre un parque."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            reverse("parks:update", kwargs={"id": self.parque.id}),
            {"nombre": "Parcial"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)



class ImagenParqueGetViewTest(BaseParquesTestCase):

    def test_get_imagenes_exitoso(self):
        url = reverse('parks:parque-imagen-list', kwargs={'id': self.parque.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['url'], "https://imagekit.io/imagen.jpg")

    def test_get_imagenes_sin_autenticacion(self):
        """AllowAny — debe funcionar sin token"""
        url = reverse('parks:parque-imagen-list', kwargs={'id': self.parque.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_imagenes_lista_vacia(self):
        parque_vacio = Parque.objects.create(
            nombre="Parque Sin Imágenes",
            direccion="Calle Vacia 000",
            latitud=19.420412,
            longitud=-99.194166,
            hora_apertura="06:00:00",
            hora_cierre="18:00:00",
            tiene_cabanas=False,
            capacidad_maxima=50,
            estatus_parque="activo",
        )
        url = reverse('parks:parque-imagen-list', kwargs={'id': parque_vacio.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_get_imagenes_parque_no_existe(self):
        url = reverse('parks:parque-imagen-list', kwargs={'id': 9999})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], "Parque no existe")

class ImagenParqueCreateViewTest(BaseParquesTestCase):
    def setUp(self):
        # Crear una imagen en memoria
        image = Image.new('RGB', (100, 100), color='red')
        image_io = io.BytesIO()
        image.save(image_io, format='JPEG')
        image_io.seek(0)

        self.imagen_file = SimpleUploadedFile(
            "foto.jpg",
            image_io.read(),
            content_type="image/jpeg"
        )
        super().setUp()
        self.url = reverse('parks:add-image', kwargs={'id': self.parque.id})
    def get_imagen_file(self):
        """Genera una imagen válida cada vez que se llama."""
        image = Image.new('RGB', (100, 100), color='red')
        image_io = io.BytesIO()
        image.save(image_io, format='JPEG')
        image_io.seek(0)
        return SimpleUploadedFile(
            "foto.jpg",
            image_io.read(),
            content_type="image/jpeg"
        )
    

    @patch('parks.views.upload_imagen_parque', return_value="https://imagekit.io/nueva.jpg")
    def test_post_imagen_exitoso(self, mock_upload):
        self.client.force_authenticate(user=self.admin)
        data = {'imagen': self.get_imagen_file(), 'es_principal': False}
        response = self.client.post(self.url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['url'], "https://imagekit.io/nueva.jpg")

    def test_post_imagen_sin_autenticacion(self):
        data = {'imagen': self.imagen_file, 'es_principal': False}
        response = self.client.post(self.url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_post_imagen_usuario_no_admin(self):
        self.client.force_authenticate(user=self.usuario)
        data = {'imagen': self.imagen_file, 'es_principal': False}
        response = self.client.post(self.url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], "No autorizado")

class RemoveImagenFromParqueViewTest(BaseParquesTestCase):

    def setUp(self):
        super().setUp()
        self.url = reverse('parks:parque-imagen-delete', kwargs={
            'id': self.parque.id,
            'imagen_id': self.imagen.id,
        })

    def test_delete_imagen_exitoso(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], "Imagen eliminada correctamente")
        self.assertFalse(ImagenParque.objects.filter(id=self.imagen.id).exists())

    def test_delete_imagen_sin_autenticacion(self):
        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
