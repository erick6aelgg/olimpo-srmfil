from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta

from users.models import Usuario
from parks.models import Parque
from .models import Servicio

class BaseServicioTestCase(TestCase):
    """
    Clase base con el setup compartido.
    Crea un usuario normal, un usuario admin, un parque 
    y un servicio asociado al parque como diccionario (para crearlo con post)
    y como objeto.
    """

    def setUp(self):
        self.client = APIClient()

        self.admin_usuario = Usuario.objects.create_user(
            username="adminuser",
            email="admin@example.com",
            password="password123",
            apellido_p="AdminApellidop",
            apellido_m="AdminApellidom",
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
        self.servicio_data = {
            "nombre": "Estacionamiento",
            "descripcion": "Zona para estacionarse",
            "parques": [self.parque.id]
        }
        self.servicio = Servicio.objects.create(
            nombre="Estacionamiento",
            descripcion="Zona para estacionarse",
        )
        self.servicio.parques.add(self.parque)

        # Fechas reutilizables
        self.fecha_inicio = date.today() + timedelta(days=10)
        self.fecha_fin = date.today() + timedelta(days=15)


class ServiciosTests(BaseServicioTestCase):

    #TESTS PARA post
    def test_crear_servicio_sin_admin_regresa_403_EXTRA(self):
        #Usamos el cliente base que no es admin
        self.client.force_authenticate(user=self.usuario)
        response = self.client.post(reverse('services:create'), data=self.servicio_data, format='json')
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["error"], "No autorizado")


    def test_crear_servicio_con_admin_regresa_201(self):
        #Usamos el usuario admin
        self.client.force_authenticate(user=self.admin_usuario)
        response = self.client.post(reverse('services:create'), data=self.servicio_data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Servicio.objects.filter(nombre="Estacionamiento").exists())
        self.assertEqual(response.data["nombre"], "Estacionamiento")

    def test_crear_servicio_datos_invalidos_regresa_400(self):
        #Usamos el cliente base que no es admin
        self.client.force_authenticate(user=self.admin_usuario)
        # Fallamos el parámetro "nombre"
        response = self.client.post(reverse('services:create'), data={
            "descripcion": "Sin nombre"
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn("nombre", response.data)

    #TESTS PARA get
    def test_listar_servicios_usuario_no_autenticado_regresa_200(self):
        """ Verifica si se lista correctamente """
        self.client.force_authenticate(user=None) 
        response = self.client.get(reverse('services:list'))
        self.assertEqual(response.status_code, 200)

    #TESTS PARA update
    def test_actualizar_servicio_sin_admin_regresa_403(self):
        self.client.force_authenticate(user=self.usuario)
        response = self.client.patch(
            reverse('services:update', kwargs={'id': self.servicio.id}),
            data={"nombre": "Nuevo nombre"},
            format='json'
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["error"], "No autorizado")

    def test_actualizar_servicio_inexistente_regresa_404(self):
        self.client.force_authenticate(user=self.admin_usuario)
        response = self.client.patch(
            reverse('services:update', kwargs={'id': 99999}),
            data={"nombre": "Nuevo nombre"},
            format='json'
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "Servicio no existe")

    def test_actualizar_servicio_con_admin_regresa_200(self):
        self.client.force_authenticate(user=self.admin_usuario)
        response = self.client.patch(
            reverse('services:update', kwargs={'id': self.servicio.id}),
            data={"nombre": "Estacionamiento Actualizado"},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.servicio.refresh_from_db()
        self.assertEqual(self.servicio.nombre, "Estacionamiento Actualizado")

    def test_actualizar_servicio_datos_invalidos_regresa_400(self):
        self.client.force_authenticate(user=self.admin_usuario)
        response = self.client.patch(
            reverse('services:update', kwargs={'id': self.servicio.id}),
            data={"nombre": ""},  # nombre vacío — inválido
            format='json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("nombre", response.data)

    #TESTS PARA delete
    def test_eliminar_servicio_sin_admin_regresa_403(self):
        self.client.force_authenticate(user=self.usuario)
        response = self.client.delete(
            reverse('services:delete', kwargs={'id': self.servicio.id})
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data["error"], "No autorizado")

    
    def test_eliminar_servicio_inexistente_regresa_404(self):
        self.client.force_authenticate(user=self.admin_usuario)
        response = self.client.delete(
            reverse('services:delete', kwargs={'id': 99999})
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "Servicio no existe")
    
    def test_eliminar_servicio_con_admin_regresa_200(self):
        self.client.force_authenticate(user=self.admin_usuario)
        response = self.client.delete(
            reverse('services:delete', kwargs={'id': self.servicio.id})
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Servicio eliminado correctamente")

    def test_eliminar_servicio_limpia_relacion_con_parques(self):
        """El parque sigue existiendo pero sin el servicio asociado"""
        self.client.force_authenticate(user=self.admin_usuario)
        servicio_id = self.servicio.id
        self.client.delete(
            reverse('services:delete', kwargs={'id': servicio_id})
        )
        # El parque sigue existiendo pero ya no tiene el servicio asociado
        self.assertTrue(Parque.objects.filter(id=self.parque.id).exists())
        self.assertEqual(self.parque.servicios.filter(id=servicio_id).count(), 0)

    #PRUEBAS DE INTEGRACIÓN
    def test_integracion_crear_y_eliminar_servicio(self):
        """Integración de create y delete"""
        #Cración del servicio
        self.client.force_authenticate(user=self.admin_usuario)
        response_crear = self.client.post(reverse('services:create'),data=self.servicio_data,format='json')
        self.assertEqual(response_crear.status_code, 201) 
        #verificamos en BD
        servicio_id = response_crear.data["id"]
        self.assertTrue(Servicio.objects.filter(id=servicio_id).exists())
        #Eliminamos el servicio
        response_eliminar = self.client.delete(
            reverse('services:delete', kwargs={'id': servicio_id})
        )
        self.assertEqual(response_eliminar.status_code, 200)
        self.assertEqual(response_eliminar.data["message"], "Servicio eliminado correctamente")
        #Verificamos que ya no existe en la BD
        self.assertFalse(Servicio.objects.filter(id=servicio_id).exists())
    
    def test_integracion_crear_y_actualizar_servicio(self):
        """Integración de create y update"""
        #Cración del servicio
        self.client.force_authenticate(user=self.admin_usuario)
        response_crear = self.client.post(reverse('services:create'),data=self.servicio_data,format='json')
        self.assertEqual(response_crear.status_code, 201)
        #verificamos en BD
        servicio_id = response_crear.data["id"]
        self.assertTrue(Servicio.objects.filter(id=servicio_id).exists())
        #Actualizamos el servicio
        response_actualizar = self.client.patch(
            reverse('services:update', kwargs={'id': servicio_id}),
            data={"nombre": "Estacionamiento VIP"},
            format='json'
        )
        self.assertEqual(response_actualizar.status_code, 200)
        #Verificamos el cambio en la BD
        servicio_actualizado = Servicio.objects.get(id=servicio_id)
        self.assertEqual(servicio_actualizado.nombre, "Estacionamiento VIP")
