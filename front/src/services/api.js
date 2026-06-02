import axios from 'axios'

/**
 * 1. CREACIÓN DE LA INSTANCIA DE AXIOS
 * Se define la URL base consumiendo las variables de entorno de Vite.
 * Si no existe 'VITE_API_URL', por defecto apunta al servidor local de desarrollo en el puerto 8000.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 2. INTERCEPTOR DE PETICIONES (REQUEST)
 * Se ejecuta automáticamente ANTES de que cualquier solicitud salga hacia el servidor.
 * Propósito: Adjuntar el token de acceso en las cabeceras HTTP si el usuario está autenticado.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    // Implementa el estándar OAuth2 / JWT inyectando el token tipo Bearer
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * 3. INTERCEPTOR DE RESPUESTAS (RESPONSE)
 * Se ejecuta inmediatamente CUANDO llega una respuesta del servidor o cuando ocurre un error.
 * Propósito: Manejar de forma transparente la expiración de tokens (Mecanismo Silent Refresh).
 */
api.interceptors.response.use(
  // Si la respuesta es exitosa (Status 2xx), la deja pasar sin alteraciones
  (response) => response,
  
  // Si el servidor responde con un código de error (Status fuera de 2xx)
  async (error) => {
    const original = error.config // Guarda la configuración de la petición original que falló
    
    /**
     * VERIFICACIÓN DE EXPIRACIÓN DEL TOKEN (Error 401 Unauthorized)
     * - error.response?.status === 401: El token de acceso actual ya no es válido o expiró.
     * - !original._retry: Bandera centinela para evitar bucles infinitos en caso de que el refresco también falle.
     */
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true // Marcamos la petición para indicar que ya está en su primer intento de reajuste
      
      const refresh = localStorage.getItem('refresh_token')
      
      if (refresh) {
        try {
          // Solicitud asíncrona directa con la librería Axios global (para evitar interceptores de instancia)
          // enviando el token de refresco al endpoint de Django Simple JWT.
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/token/refresh/`,
            { refresh }
          )
          
          // 1. Almacenar el nuevo token de acceso generado por el backend
          localStorage.setItem('access_token', data.access)
          
          // 2. Reemplazar la cabecera de autorización vieja por la nueva
          original.headers.Authorization = `Bearer ${data.access}`
          
          // 3. Re-ejecutar la petición original que había fallado, ahora con el nuevo token.
          // El usuario final nunca se entera de que el token se renovó tras bambalinas.
          return api(original)
          
        } catch {
          // Si el proceso de refresco falla (por ejemplo, el refresh_token también expiró o es inválido),
          // significa que la sesión caducó por completo. Se limpia el almacenamiento y se fuerza el Login.
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    
    // Retorna cualquier otro tipo de error (400, 403, 404, 500, etc.) para que sea manejado en el .catch() de los componentes
    return Promise.reject(error)
  }
)

export default api