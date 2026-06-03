import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Register() {
  // Hook de autenticación
  const { register } = useAuth()
  const navigate = useNavigate()

  // Estado del formulario
  const [form, setForm] = useState({
    nombre: '',
    apellidoP: '',
    apellidoM: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // Estados de UI
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  // Visibilidad de contraseñas
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Validaciones regex
  const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  /**
   * Maneja cambios en inputs
   */
  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpia errores mientras el usuario escribe
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }))

    setSuccess('')
  }

  /**
   * Validación del formulario
   */
  const validate = () => {
    const newErrors = {}

    // NOMBRE
    if (!form.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio.'
    } else if (!onlyLetters.test(form.nombre)) {
      newErrors.nombre = 'El nombre solo puede contener letras.'
    }

    // APELLIDO PATERNO
    if (!form.apellidoP.trim()) {
      newErrors.apellidoP = 'El apellido paterno es obligatorio.'
    } else if (!onlyLetters.test(form.apellidoP)) {
      newErrors.apellidoP = 'El apellido paterno solo puede contener letras.'
    }

    // APELLIDO MATERNO
    if (!form.apellidoM.trim()) {
      newErrors.apellidoM = 'El apellido materno es obligatorio.'
    } else if (!onlyLetters.test(form.apellidoM)) {
      newErrors.apellidoM = 'El apellido materno solo puede contener letras.'
    }

    // EMAIL
    if (!form.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio.'
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido.'
    }

    // PASSWORD
    if (!form.password) {
      newErrors.password = 'La contraseña es obligatoria.'
    } else if (form.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
    }

    // CONFIRM PASSWORD
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar tu contraseña.'
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.'
    }

    return newErrors
  }

  /**
   * Envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validate()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      // Registro en backend
      await register(
        form.nombre,
        form.apellidoP,
        form.apellidoM,
        form.email,
        form.password
      )

      // Mensaje de éxito
      setSuccess(
        'Cuenta creada exitosamente. Redirigiendo al inicio de sesión...'
      )

      // Redirección con pequeño delay
      setTimeout(() => {
        navigate('/login', {
          state: { registered: true },
        })
      }, 1800)
    } catch (err) {
      const data = err.response?.data

      // Errores del backend
      if (data) {
        const backendErrors = {}

        Object.keys(data).forEach((key) => {
          backendErrors[key] = Array.isArray(data[key])
            ? data[key][0]
            : data[key]
        })

        setErrors(backendErrors)
      } else {
        setErrors({
          general: 'Ocurrió un error. Intenta de nuevo.',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Fondo animado */}
      <div className="fireflies" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="firefly" style={{ '--i': i }} />
        ))}
      </div>

      {/* Card principal */}
      <div className="auth-card auth-card--wide">
        <div className="auth-brand">
          <span className="brand-icon">✦</span>
          <span className="brand-name">Luciérnagas 2026</span>
        </div>

        <h1 className="auth-title">Crea tu cuenta</h1>
        <p className="auth-sub">
          Únete y reserva tu experiencia en el bosque
        </p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* NOMBRE */}
          <div className="field">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              placeholder="María"
              value={form.nombre}
              onChange={handleChange}
              className={errors.nombre ? 'input-error' : ''}
            />
            {errors.nombre && <p className="field-error">{errors.nombre}</p>}
          </div>

          {/* APELLIDOS */}
          <div className="field-row">
            <div className="field">
              <label htmlFor="apellidoP">Apellido paterno</label>
              <input
                id="apellidoP"
                name="apellidoP"
                type="text"
                placeholder="García"
                value={form.apellidoP}
                onChange={handleChange}
                className={errors.apellidoP ? 'input-error' : ''}
              />
              {errors.apellidoP && (
                <p className="field-error">{errors.apellidoP}</p>
              )}
            </div>

            <div className="field">
              <label htmlFor="apellidoM">Apellido materno</label>
              <input
                id="apellidoM"
                name="apellidoM"
                type="text"
                placeholder="López"
                value={form.apellidoM}
                onChange={handleChange}
                className={errors.apellidoM ? 'input-error' : ''}
              />
              {errors.apellidoM && (
                <p className="field-error">{errors.apellidoM}</p>
              )}
            </div>
          </div>

          {/* EMAIL */}
          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu@correo.com"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          {/* PASSWORDS */}
          <div className="field-row">
            {/* PASSWORD */}
            <div className="field">
              <label htmlFor="password">Contraseña</label>

              <div className="password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={handleChange}
                  className={errors.password ? 'input-error' : ''}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {errors.password && (
                <p className="field-error">{errors.password}</p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="field">
              <label htmlFor="confirmPassword">
                Confirmar contraseña
              </label>

              <div className="password-wrapper">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repite tu contraseña"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'input-error' : ''}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="field-error">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* ERROR GENERAL */}
          {errors.general && (
            <p className="auth-error" role="alert">
              {errors.general}
            </p>
          )}

          {/* SUCCESS */}
          {success && <p className="auth-success">{success}</p>}

          {/* SUBMIT */}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Crear cuenta'}
          </button>
        </form>

        {/* LINK LOGIN */}
        <p className="auth-footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="auth-link">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}