import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import './Auth.css'

export default function Login() {
  // Hook de autenticación
  const { login } = useAuth()
  const navigate = useNavigate()

  // Estado del formulario
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  // Estado de errores
  const [errors, setErrors] = useState({})

  // Estado de loading (envío)
  const [loading, setLoading] = useState(false)

  // Mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false)

  /**
   * Maneja cambios en inputs
   */
  const handleChange = (e) => {
    const { name, value } = e.target

    // Actualiza formulario
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpia errores del campo mientras el usuario escribe
    setErrors((prev) => ({
      ...prev,
      [name]: '',
      general: '',
    }))
  }

  /**
   * Validación básica del formulario
   */
  const validate = () => {
    const newErrors = {}

    if (!form.email.trim()) {
      newErrors.email = 'El correo es obligatorio.'
    }

    if (!form.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria.'
    }

    return newErrors
  }

  /**
   * Envío del formulario de login
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar campos
    const validation = validate()
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      // Intento de login
      await login(form.email, form.password)

      // Redirección al home si todo sale bien
      navigate('/')
    } catch (err) {
      const data = err.response?.data

      // Mensaje por defecto
      let message = 'Correo o contraseña incorrectos.'

      if (data?.detail) {
        message = data.detail
      }

      // Normalización de errores comunes del backend
      if (
        message.toLowerCase().includes('no active account') ||
        message.toLowerCase().includes('not found') ||
        message.toLowerCase().includes('user')
      ) {
        message = 'No existe una cuenta con este correo.'
      }

      setErrors({ general: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Fondo animado de luciérnagas */}
      <div className="fireflies" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="firefly" style={{ '--i': i }} />
        ))}
      </div>

      {/* Card de login */}
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-icon">✦</span>
          <span className="brand-name">Luciérnagas 2026</span>
        </div>

        <h1 className="auth-title">Bienvenido de vuelta</h1>
        <p className="auth-sub">
          Inicia sesión para gestionar tus reservaciones
        </p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* EMAIL */}
          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="field-error">{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="field">
            <label htmlFor="password">Contraseña</label>

            <div className="password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />

              {/* Toggle de visibilidad de contraseña */}
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {errors.password && (
              <p className="field-error">{errors.password}</p>
            )}
          </div>

          {/* ERROR GENERAL */}
          {errors.general && (
            <p className="auth-error" role="alert">
              {errors.general}
            </p>
          )}

          {/* BOTÓN SUBMIT */}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Iniciar sesión'}
          </button>
        </form>

        {/* LINK A REGISTRO */}
        <p className="auth-footer">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registrarse" className="auth-link">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}