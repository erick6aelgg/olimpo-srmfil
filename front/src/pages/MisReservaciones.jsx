import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './MisReservaciones.css'

const fmt = (t) => {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hr = parseInt(h)
  return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`
}

const fmtDate = (d) => {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

const diffDays = (a, b) => {
  const d1 = new Date(a), d2 = new Date(b)
  return Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)))
}

const STATUS_LABEL = { activa: 'Activa', cancelada: 'Cancelada', completada: 'Completada' }
const STATUS_CLASS = { activa: 'mr-status--active', cancelada: 'mr-status--cancelled', completada: 'mr-status--done' }

export default function MisReservaciones() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [reservaciones, setReservaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelMsg, setCancelMsg] = useState('')
  const menuRef = useRef(null)

  const fetchReservaciones = () => {
    if (!user?.id) return
    setLoading(true)
    api.get(`/api/reservations/user/${user.id}/`)
      .then(({ data }) => setReservaciones(Array.isArray(data) ? data : data.results || []))
      .catch(() => setError('No se pudieron cargar tus reservaciones.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReservaciones() }, [user])

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      await api.patch(`/api/reservations/${cancelTarget.id}/cancel/`)
      setCancelMsg('Reservación cancelada exitosamente.')
      setCancelTarget(null)
      fetchReservaciones()
    } catch {
      setCancelMsg('No se pudo cancelar. Intenta de nuevo.')
    } finally {
      setCancelling(false)
    }
  }

  const activas = reservaciones.filter(r => r.estatus === 'activa' || !r.estatus || r.estado === 'activa')
  const historial = reservaciones.filter(r => r.estatus !== 'activa' && r.estado !== 'activa' && (r.estatus || r.estado))

  const initials = user
    ? `${user.first_name?.[0] || ''}${(user.apellido_p || user.last_name)?.[0] || ''}`.toUpperCase() || '?'
    : '?'

  return (
    <div className="mr-root">
      {/* Header */}
      <header className="mr-header">
        <Link to="/" className="mr-logo">
          <span className="mr-logo-icon">✦</span>
          <span className="mr-logo-text">Luciérnagas <em>2026</em></span>
        </Link>
        <nav className="mr-nav">
          <Link to="/" className="mr-nav-link">Inicio</Link>
          <Link to="/parques" className="mr-nav-link">Parques</Link>
          <Link to="/mis-reservaciones" className="mr-nav-link mr-nav-link--active">Mis Reservas</Link>
        </nav>
        <div className="mr-user" ref={menuRef}>
          <button className="mr-avatar" onClick={() => setMenuOpen(!menuOpen)}>{initials}</button>
          <div className={`mr-dropdown ${menuOpen ? 'mr-dropdown--open' : ''}`}>
            <div className="mr-dropdown-header">
              <p className="mr-dropdown-name">{user?.first_name} {user?.apellido_p}</p>
              <p className="mr-dropdown-email">{user?.email}</p>
            </div>
            <Link to="/perfil" className="mr-dropdown-item" onClick={() => setMenuOpen(false)}>👤 Mi perfil</Link>
            <Link to="/parques" className="mr-dropdown-item" onClick={() => setMenuOpen(false)}>🗺️ Ver parques</Link>
            <button className="mr-dropdown-item mr-dropdown-item--danger" onClick={() => { logout(); navigate('/login') }}>🚪 Cerrar sesión</button>
          </div>
        </div>
      </header>

      <main className="mr-main">
        {/* Page title */}
        <div className="mr-page-head">
          <div>
            <h1 className="mr-page-title">📋 Mis reservaciones</h1>
            <p className="mr-page-sub">Gestiona tus visitas al festival · {user?.email}</p>
          </div>
          <Link to="/parques" className="mr-btn-new">✦ Nueva reservación</Link>
        </div>

        {/* Success msg */}
        {cancelMsg && (
          <div className="mr-alert mr-alert--success">
            ✓ {cancelMsg}
            <button className="mr-alert-close" onClick={() => setCancelMsg('')}>✕</button>
          </div>
        )}

        {/* Stats */}
        {!loading && (
          <div className="mr-stats">
            <div className="mr-stat">
              <span className="mr-stat-num">{reservaciones.length}</span>
              <span className="mr-stat-label">Total</span>
            </div>
            <div className="mr-stat">
              <span className="mr-stat-num mr-stat-num--green">{activas.length}</span>
              <span className="mr-stat-label">Activas</span>
            </div>
            <div className="mr-stat">
              <span className="mr-stat-num">{historial.length}</span>
              <span className="mr-stat-label">Historial</span>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mr-loading">
            <span className="mr-spinner" />
            <p>Cargando reservaciones…</p>
          </div>
        )}

        {/* Error */}
        {error && <div className="mr-alert mr-alert--error">⚠️ {error}</div>}

        {/* Active reservations */}
        {!loading && !error && (
          <>
            <section className="mr-section">
              <h2 className="mr-section-title">Reservaciones activas</h2>
              {activas.length === 0 ? (
                <div className="mr-empty">
                  <span className="mr-empty-icon">🌿</span>
                  <p>No tienes reservaciones activas.</p>
                  <Link to="/parques" className="mr-btn-primary">Explorar parques</Link>
                </div>
              ) : (
                <div className="mr-cards">
                  {activas.map(r => (
                    <ReservacionCard key={r.id} r={r} onCancel={() => setCancelTarget(r)} />
                  ))}
                </div>
              )}
            </section>

            {historial.length > 0 && (
              <section className="mr-section">
                <h2 className="mr-section-title">Historial</h2>
                <div className="mr-cards mr-cards--muted">
                  {historial.map(r => (
                    <ReservacionCard key={r.id} r={r} historial />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Cancel modal */}
      {cancelTarget && (
        <div className="mr-modal-overlay" onClick={() => setCancelTarget(null)}>
          <div className="mr-modal" onClick={e => e.stopPropagation()}>
            <div className="mr-modal-icon">⚠️</div>
            <h3 className="mr-modal-title">Cancelar reservación</h3>
            <p className="mr-modal-msg">
              ¿Estás seguro de que deseas cancelar tu reservación en <strong>{cancelTarget.parque?.nombre || cancelTarget.parque_nombre || 'este parque'}</strong> del <strong>{fmtDate(cancelTarget.fecha_inicio)}</strong>?
            </p>
            <p className="mr-modal-note">Esta acción no se puede deshacer.</p>
            <div className="mr-modal-actions">
              <button className="mr-btn-cancel" onClick={() => setCancelTarget(null)}>No, mantener</button>
              <button className="mr-btn-danger" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? <span className="mr-spinner-sm" /> : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mr-footer">
        <p>Festival Internacional de las Luciérnagas 2026</p>
      </footer>
    </div>
  )
}

function ReservacionCard({ r, onCancel, historial }) {
  const parqueNombre = r.parque?.nombre || r.parque_nombre || `Parque #${r.parque}`
  const dias = r.fecha_inicio && r.fecha_fin ? diffDays(r.fecha_inicio, r.fecha_fin) : '—'
  const status = r.estatus || r.estado || 'activa'

  return (
    <div className={`mr-card ${historial ? 'mr-card--muted' : ''}`}>
      <div className="mr-card-head">
        <div>
          <h3 className="mr-card-park">{parqueNombre}</h3>
          <p className="mr-card-type">
            {r.tipo_visita === 'cabaña' ? '🏠 Cabaña' : '⛺ Camping'} · {dias} {dias === 1 ? 'noche' : 'noches'}
          </p>
        </div>
        <span className={`mr-status ${STATUS_CLASS[status] || 'mr-status--active'}`}>
          {STATUS_LABEL[status] || 'Activa'}
        </span>
      </div>

      <div className="mr-card-info">
        <div className="mr-info-item">
          <span className="mr-info-label">Entrada</span>
          <span className="mr-info-val">{fmtDate(r.fecha_inicio)}</span>
        </div>
        <div className="mr-info-item">
          <span className="mr-info-label">Salida</span>
          <span className="mr-info-val">{fmtDate(r.fecha_fin)}</span>
        </div>
        <div className="mr-info-item">
          <span className="mr-info-label">Personas</span>
          <span className="mr-info-val">👥 {r.num_personas}</span>
        </div>
        <div className="mr-info-item">
          <span className="mr-info-label">Reservación #</span>
          <span className="mr-info-val">{r.id}</span>
        </div>
      </div>

      {!historial && status === 'activa' && (
        <div className="mr-card-foot">
          <p className="mr-card-note">✉️ Confirmación enviada a tu correo</p>
          <button className="mr-btn-cancel-card" onClick={onCancel}>Cancelar reservación</button>
        </div>
      )}
    </div>
  )
}
