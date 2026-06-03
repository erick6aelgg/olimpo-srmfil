# Sistema de Reservación y Mapeo para el Festival Internacional de las Luciérnagas 2026
## Olimpo
- Andrade Luviano Ximena
- García Gutiérrez Erick Gael
- Gerónimo Soto Leslie
- Guitérrez Morales Joel Isaac
- Sautto Ramirez Seldon

## Descripción del proyecto

Sistema web para centralizar la información de los parques del Festival Internacional de las Luciérnagas y administrar las reservaciones de los visitantes. Permite a los usuarios explorar parques en un mapa interactivo, consultar información detallada de cada sitio y realizar reservaciones de hospedaje en cabañas o zonas de camping.

---

## Despliegue
El sistema se encuentra desplegado en [olimpo-srmfil.netlify.app](https://olimpo-srmfil.netlify.app).

---

## Tecnologías utilizadas
 
- **Frontend:** React + Vite, Tailwind CSS, React Router, Leaflet
- **Backend:** Django (Django REST Framework), Simple JWT
- **Base de datos:** PostgreSQL
- **Almacenamiento de imágenes:** ImageKit
- **Despliegue:** Netlify (frontend), Railway (backend + base de datos)


---


## Instrucciones para ejecutar de manera local



### Requisitos previos
 
- Python 3.12 o superior
- Node.js 18 o superior
- PostgreSQL 16 o superior
- Git


### Primeros pasos

**Clonar el repositorio** 
Clona y accede a la carpeta raíz del proyecto:

```bash
git clone https://github.com/erick6aelgg/olimpo-srmfil.git
cd olimpo-srmfil
```
   

### Backend (Django + PostgreSQL)
RAccede al directorio del backend:
 
```bash
cd srmfil
```
 
Instala las dependencias:
 
```bash
pip install -r requirements.txt
```

Necesitaras una cuenta en [imagekit.io](https://imagekit.io/) y tener activo PostgreSQL.
 
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
 
```
SECRET_KEY= 
DEBUG=True
ALLOWED_HOSTS=localhost
DATABASE_URL=postgres:

JWT_SIGNING_KEY=
ACCESS_TOKEN_LIFETIME_HOURS=

EMAIL_HOST_USER= un correode prueba
EMAIL_HOST_PASSWORD= contraseña de aplicación de dicho correo

IMAGEKIT_PUBLIC_KEY= Disponibles en la sección de opciones
IMAGEKIT_PRIVATE_KEY= de desarrollador en imagekit.io
IMAGEKIT_URL_ENDPOINT=

CORS_ALLOWED_ORIGINS= Url del front

```
 
Aplica las migraciones:
 
```bash
python manage.py migrate
```
 
Crea un usuario administrador:
 
```bash
python manage.py createsuperuser
```
 
Inicia el servidor local:
 
```bash
python manage.py runserver
```
 
El servidor estará disponible comunmente en `http://127.0.0.1:8000`.



### Frontend (React + Vite)
En otra terminal, accede al directorio del frontend:
 
```bash
cd front
```
 
Instala las dependencias:
 
```bash
npm install
```
 
Crea un archivo `.env` en la raíz del directorio `front` donde está el servidor Django:
 
```
VITE_API_URL=http://127.0.0.1:8000
```
 
Inicia el servidor de desarrollo:
 
```bash
npm run dev
```
 
La interfaz estará disponible comunmente en `http://localhost:5173`.
 

