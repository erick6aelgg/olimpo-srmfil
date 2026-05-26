import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/api/users/login/', { email, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    const profile = await api.get('/api/users/me/')
    localStorage.setItem('user', JSON.stringify(profile.data))
    setUser(profile.data)
    return profile.data
  }

  const register = async (nombre, apellidoP, apellidoM, email, password) => {
  const payload = {
    first_name: nombre,
    apellido_p: apellidoP,
    apellido_m: apellidoM,
    email,
    password,
    tipo_usuario: 'cliente',
  }
  console.log('PAYLOAD:', payload) 
  const { data } = await api.post('/api/users/register/', payload)
  return data
}

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
