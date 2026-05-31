import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

// Creación del contexto de autenticación, inicializado en null por seguridad.
const AuthContext = createContext(null)

/**
 * Proveedor del Contexto de Autenticación (Componente de Orden Superior).
 * Encapsula el estado del usuario, la persistencia en caché y los métodos de sesión.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)     // Almacena los datos del perfil del usuario autenticado
  const [loading, setLoading] = useState(true) // Controla el estado de carga inicial mientras se verifica la sesión existente

  /**
   * Efecto de inicialización única (se ejecuta al montar la aplicación).
   * Recupera la sesión previa desde localStorage para evitar re-autenticaciones en F5.
   */
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')
    
    if (token && storedUser) {
      // Si existen las credenciales locales, se parsean e inyectan al estado global
      setUser(JSON.parse(storedUser))
    }
    // Finaliza el estado de carga independientemente de si se encontró sesión o no
    setLoading(false)
  }, [])

  /**
   * Método de inicio de sesión asíncrono.
   * Envía las credenciales, almacena los tokens JWT del backend (Simple JWT / DRF)
   * y posteriormente solicita el perfil detallado del usuario autenticado.
   */
  const login = async (email, password) => {
    // 1. Petición para obtener el par de tokens (Access y Refresh)
    const { data } = await api.post('/api/users/login/', { email, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    
    // 2. Petición secundaria usando el interceptor/token para traer los datos del cliente actual
    const profile = await api.get('/api/users/me/')
    localStorage.setItem('user', JSON.stringify(profile.data))
    
    // 3. Sincronización del estado global para actualizar la interfaz inmediatamente
    setUser(profile.data)
    return profile.data
  }

  /**
   * Método de registro de nuevos usuarios en la plataforma.
   * Modela el payload con la estructura exacta de nombres que espera el Backend de Django.
   */
  const register = async (nombre, apellidoP, apellidoM, email, password) => {
    const payload = {
      first_name: nombre,
      apellido_p: apellidoP,
      apellido_m: apellidoM,
      email,
      password,
      tipo_usuario: 'cliente', // Por defecto, todos los registros públicos se crean con rol de cliente
    }
    
    console.log('PAYLOAD:', payload) // Debug de payload en desarrollo
    
    // Envía los datos al endpoint de registro
    const { data } = await api.post('/api/users/register/', payload)
    return data
  }

  /**
   * Destruye de forma segura la sesión del usuario actual.
   * Limpia el almacenamiento del navegador y reajusta el estado de autenticación de React a null.
   */
  const logout = () => {
    localStorage.clear() // Elimina access_token, refresh_token y los datos de perfil de usuario
    setUser(null)        // Desconecta al usuario globalmente en toda la SPA
  }

  return (
    // Se exponen tanto el estado (user, loading) como las mutaciones asíncronas
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom Hook semántico para consumir el Contexto de Autenticación de manera directa.
 * Permite acceder a la sesión actual desde cualquier componente hijo de la jerarquía.
 * @example const { user, logout } = useAuth();
 */
export const useAuth = () => useContext(AuthContext)