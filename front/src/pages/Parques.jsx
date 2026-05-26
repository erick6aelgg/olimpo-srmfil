import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './Parques.css'

const fireflyIcon = (active = false) =>
  L.divIcon({
    className: '',
    html: `<div class="map-marker ${active ? 'map-marker--active' : ''}">
             <div class="marker-core"></div>
             <div class="marker-ring"></div>
             <div class="marker-ring marker-ring--2"></div>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

function FlyTo({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, 14, { duration: 1.4 })
  }, [coords, map])
  return null
}

const fmt = (t) => {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hr = parseInt(h)
  return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`
}

const today = () => new Date().toISOString().split('T')[0]

const isTuesday = (dateStr) => new Date(dateStr).getDay() === 2

const isInSeason = (dateStr) => {
  const d = new Date(dateStr)
  const m = d.getMonth() + 1
  return m >= 6 && m <= 8
}

export default function Parques() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [parques, setParques] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Reservation form state
  const [form, setForm] = useState({
    parque_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    num_personas: 1,
    tipo_visita: 'camping',
  })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get('/api/parks/')
      .then(({ data }) => setParques(Array.isArray(data) ? data : data.results || []))
      .catch(() => setParques([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const selectPark = (p) => {
    setSelected(p)
    setPanelOpen(true)
    setForm(f => ({ ...f, parque_id: String(p.id), tipo_visita: p.tiene_cabanas ? 'cabaña' : 'camping' }))
  }

  const closePanel = () => {
    setPanelOpen(false)
    setTimeout(() => setSelected(null), 300)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setFormError('')
  }

  const validateForm = () => {
    if (!form.parque_id) return 'Selecciona un parque.'
    if (!form.fecha_inicio) return 'Selecciona fecha de inicio.'
    if (!form.fecha_fin) return 'Selecciona fecha de fin.'
    if (!isInSeason(form.fecha_inicio) || !isInSeason(form.fecha_fin))
      return 'Las reservaciones solo están disponibles de junio a agosto.'
    if (isTuesday(form.fecha_inicio))
      return 'No se permiten reservaciones los martes (día de mantenimiento).'
    if (new Date(form.fecha_fin) <= new Date(form.fecha_inicio))
      return 'La fecha de fin debe ser posterior a la de inicio.'
    if (form.num_personas < 1) return 'Mínimo 1 persona.'
    const parque = parques.find(p => String(p.id) === String(form.parque_id))
    if (parque && form.num_personas > parque.capacidad_maxima)
      return `Capacidad máxima de este parque: ${parque.capacidad_maxima} personas.`
    const parqueSeleccionado = parques.find(p => String(p.id) === String(form.parque_id))
    if (form.tipo_visita === 'cabaña' && parqueSeleccionado && !parqueSeleccionado.tiene_cabanas)
      return 'Este parque no tiene cabañas disponibles.'
    return null
  }

  const handleReservar = async (e) => {
    e.preventDefault()
    const err = validateForm()
    if (err) { setFormError(err); return }
    if (!user) { navigate('/login'); return }
    setSubmitting(true)
    setFormError('')
    try {
      await api.post('/api/reservations/', {
        parque: parseInt(form.parque_id),
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        num_personas: parseInt(form.num_personas),
        tipo_visita: form.tipo_visita,
      })
      setFormSuccess(true)
      setForm({ parque_id: '', fecha_inicio: '', fecha_fin: '', num_personas: 1, tipo_visita: 'camping' })
    } catch (err) {
      const data = err.response?.data
      if (data) {
        const first = Object.values(data)[0]
        setFormError(Array.isArray(first) ? first[0] : String(first))
      } else {
        setFormError('Error al crear la reservación. Intenta de nuevo.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const activeParques = parques.filter(p => p.estatus_parque === 'activo')
  const center = activeParques.length
    ? [parseFloat(activeParques[0].latitud), parseFloat(activeParques[0].longitud)]
    : [19.066, -98.76]

  const initials = user
    ? `${user.first_name?.[0] || ''}${(user.apellido_p || user.last_name)?.[0] || ''}`.toUpperCase() || '?'
    : '?'

  const parqueForm = parques.find(p => String(p.id) === String(form.parque_id))

  return (
    <div className="pq-root">

      {/* Header */}
      <header className="pq-header">
        <Link to="/" className="pq-logo">
          <span className="pq-logo-icon">✦</span>
          <span className="pq-logo-text">Luciérnagas <em>2026</em></span>
        </Link>
        <nav className="pq-nav">
          <Link to="/" className="pq-nav-link">Inicio</Link>
          <Link to="/parques" className="pq-nav-link pq-nav-link--active">Parques</Link>
          <Link to="/mis-reservaciones" className="pq-nav-link">Mis Reservas</Link>
        </nav>
        <div className="pq-user" ref={menuRef}>
          <button className="pq-avatar" onClick={() => setMenuOpen(!menuOpen)}>
            <span>{initials}</span>
          </button>
          <div className={`pq-dropdown ${menuOpen ? 'pq-dropdown--open' : ''}`}>
            <div className="pq-dropdown-header">
              <p className="pq-dropdown-name">{user?.first_name} {user?.apellido_p}</p>
              <p className="pq-dropdown-email">{user?.email}</p>
            </div>
            <Link to="/mis-reservaciones" className="pq-dropdown-item" onClick={() => setMenuOpen(false)}>📋 Mis reservaciones</Link>
            <Link to="/perfil" className="pq-dropdown-item" onClick={() => setMenuOpen(false)}>👤 Mi perfil</Link>
            <button className="pq-dropdown-item pq-dropdown-item--danger" onClick={() => { logout(); navigate('/login') }}>🚪 Cerrar sesión</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pq-hero">
        <div className="pq-hero-fireflies" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="pq-firefly" style={{ '--i': i }} />
          ))}
        </div>
        <div className="pq-hero-content">
          <h1 className="pq-hero-title">Parques <span className="pq-accent">Oficiales</span></h1>
          <p className="pq-hero-sub">Selecciona un marcador en el mapa para conocer los detalles y reservar tu visita</p>
        </div>
      </section>

      {/* Map */}
      <section className="pq-map-section">
        <div className="pq-section-head">
          <h2 className="pq-section-title">🗺️ Mapa interactivo</h2>
          <span className="pq-badge">{activeParques.length} parques activos</span>
        </div>

        <div className="pq-map-wrap">
          {!loading ? (
            <MapContainer center={center} zoom={11} className="pq-leaflet-map" zoomControl={true}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              {selected && <FlyTo coords={[parseFloat(selected.latitud), parseFloat(selected.longitud)]} />}
              {activeParques.map(p => (
                <Marker
                  key={p.id}
                  position={[parseFloat(p.latitud), parseFloat(p.longitud)]}
                  icon={fireflyIcon(selected?.id === p.id)}
                  eventHandlers={{ click: () => selectPark(p) }}
                />
              ))}
            </MapContainer>
          ) : (
            <div className="pq-map-loading">
              <span className="pq-spinner" />
              <p>Cargando parques…</p>
            </div>
          )}
        </div>

        {/* Park detail panel */}
        <div className={`pq-overlay ${panelOpen ? 'pq-overlay--open' : ''}`} onClick={closePanel} />
        <aside className={`pq-panel ${panelOpen ? 'pq-panel--open' : ''}`}>
          {selected && (
            <>
              <div className="pq-panel-img">
                {selected.imagenes?.find(i => i.es_principal)
                  ? <img src={selected.imagenes.find(i => i.es_principal).url} alt={selected.nombre} />
                  : <div className="pq-panel-img-ph">✦</div>
                }
                <button className="pq-panel-close" onClick={closePanel}>✕</button>
                <div className="pq-panel-img-grad" />
              </div>

              <div className="pq-panel-body">
                <div className="pq-tags">
                  <span className="pq-tag pq-tag--green">🌿 Activo</span>
                  {selected.tiene_cabanas && <span className="pq-tag pq-tag--yellow">🏠 Cabañas</span>}
                  <span className="pq-tag pq-tag--gray">⛺ Camping</span>
                </div>

                <h2 className="pq-panel-title">{selected.nombre}</h2>
                <p className="pq-panel-addr">📍 {selected.direccion}</p>

                <div className="pq-info-grid">
                  <div className="pq-info-item">
                    <span className="pq-info-label">Apertura</span>
                    <span className="pq-info-val">{fmt(selected.hora_apertura)}</span>
                  </div>
                  <div className="pq-info-item">
                    <span className="pq-info-label">Cierre</span>
                    <span className="pq-info-val">{fmt(selected.hora_cierre)}</span>
                  </div>
                  <div className="pq-info-item">
                    <span className="pq-info-label">Capacidad</span>
                    <span className="pq-info-val">{selected.capacidad_maxima} personas</span>
                  </div>
                  <div className="pq-info-item">
                    <span className="pq-info-label">Temporada</span>
                    <span className="pq-info-val">Jun – Ago 2026</span>
                  </div>
                </div>

                {selected.servicios?.length > 0 && (
                  <div className="pq-services">
                    <p className="pq-services-label">Servicios disponibles</p>
                    <div className="pq-services-list">
                      {selected.servicios.map((s, i) => (
                        <span key={i} className="pq-service-chip">{s.nombre || s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selected.imagenes?.length > 1 && (
                  <div className="pq-gallery">
                    <p className="pq-gallery-label">Galería</p>
                    <div className="pq-gallery-row">
                      {selected.imagenes.slice(0, 4).map((img, i) => (
                        <img key={i} src={img.url} alt={`Foto ${i + 1}`} className="pq-gallery-thumb" />
                      ))}
                    </div>
                  </div>
                )}

                <div className="pq-hospedaje">
                  <div className={`pq-hosp-card ${selected.tiene_cabanas ? 'pq-hosp-card--on' : 'pq-hosp-card--off'}`}>
                    <span className="pq-hosp-icon">🏠</span>
                    <span className="pq-hosp-name">Cabañas</span>
                    <span className="pq-hosp-status">{selected.tiene_cabanas ? 'Disponible' : 'No disponible'}</span>
                  </div>
                  <div className="pq-hosp-card pq-hosp-card--on">
                    <span className="pq-hosp-icon">⛺</span>
                    <span className="pq-hosp-name">Camping</span>
                    <span className="pq-hosp-status">Siempre disponible</span>
                  </div>
                </div>

                <p className="pq-panel-note">⚠️ No se permiten reservas los martes. Temporada jun–ago.</p>

                <button
                  className="pq-btn-primary"
                  onClick={() => {
                    closePanel()
                    setTimeout(() => {
                      document.getElementById('reservar-form')?.scrollIntoView({ behavior: 'smooth' })
                    }, 350)
                  }}
                >
                  ✦ Reservar este parque
                </button>
              </div>
            </>
          )}
        </aside>
      </section>

      {/* Parks list */}
      <section className="pq-list-section">
        <div className="pq-section-head">
          <h2 className="pq-section-title">🌿 Todos los parques</h2>
        </div>
        {loading ? (
          <div className="pq-cards">
            {[1,2,3,4].map(i => <div key={i} className="pq-card-skeleton" />)}
          </div>
        ) : (
          <div className="pq-cards">
            {activeParques.map(p => (
              <button
                key={p.id}
                className={`pq-card ${selected?.id === p.id ? 'pq-card--active' : ''}`}
                onClick={() => selectPark(p)}
              >
                <div className="pq-card-img">
                  {p.imagenes?.find(i => i.es_principal)
                    ? <img src={p.imagenes.find(i => i.es_principal).url} alt={p.nombre} />
                    : <div className="pq-card-img-ph">✦</div>
                  }
                  <span className="pq-card-badge">{p.tiene_cabanas ? '🏠 + ⛺' : '⛺'}</span>
                </div>
                <div className="pq-card-body">
                  <h3 className="pq-card-name">{p.nombre}</h3>
                  <p className="pq-card-addr">📍 {p.direccion}</p>
                  <p className="pq-card-hours">🕐 {fmt(p.hora_apertura)} – {fmt(p.hora_cierre)}</p>
                  <div className="pq-card-foot">
                    <span className="pq-card-cap">👥 {p.capacidad_maxima} personas</span>
                    <span className="pq-card-cta">Ver detalles →</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Reservation form */}
      <section className="pq-form-section" id="reservar-form">
        <div className="pq-form-inner">
          <div className="pq-form-head">
            <h2 className="pq-section-title">✦ Hacer una reservación</h2>
            <p className="pq-section-sub">Completa los datos para reservar tu visita · Solo jun–ago · Sin martes</p>
          </div>

          {formSuccess ? (
            <div className="pq-success">
              <div className="pq-success-icon">✦</div>
              <h3 className="pq-success-title">¡Reservación realizada!</h3>
              <p className="pq-success-msg">Recibirás un correo de confirmación en <strong>{user?.email}</strong> con todos los detalles de tu reservación.</p>
              <div className="pq-success-actions">
                <button className="pq-btn-primary" onClick={() => { setFormSuccess(false) }}>Hacer otra reservación</button>
                <Link to="/mis-reservaciones" className="pq-btn-secondary">Ver mis reservaciones</Link>
              </div>
            </div>
          ) : (
            <form className="pq-reservation-form" onSubmit={handleReservar} noValidate>
              <div className="pq-form-grid">
                <div className="pq-field pq-field--full">
                  <label>Parque</label>
                  <select name="parque_id" value={form.parque_id} onChange={handleFormChange} required>
                    <option value="">— Selecciona un parque —</option>
                    {activeParques.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                {parqueForm && (
                  <div className="pq-field pq-field--full">
                    <div className="pq-park-preview">
                      <span>📍 {parqueForm.direccion}</span>
                      <span>🕐 {fmt(parqueForm.hora_apertura)} – {fmt(parqueForm.hora_cierre)}</span>
                      <span>👥 Capacidad: {parqueForm.capacidad_maxima}</span>
                    </div>
                  </div>
                )}

                <div className="pq-field">
                  <label>Fecha de inicio</label>
                  <input
                    type="date" name="fecha_inicio"
                    value={form.fecha_inicio}
                    min={today()}
                    onChange={handleFormChange} required
                  />
                </div>

                <div className="pq-field">
                  <label>Fecha de fin</label>
                  <input
                    type="date" name="fecha_fin"
                    value={form.fecha_fin}
                    min={form.fecha_inicio || today()}
                    onChange={handleFormChange} required
                  />
                </div>

                <div className="pq-field">
                  <label>Número de personas</label>
                  <input
                    type="number" name="num_personas"
                    value={form.num_personas} min="1"
                    max={parqueForm?.capacidad_maxima || 999}
                    onChange={handleFormChange} required
                  />
                </div>

                <div className="pq-field">
                  <label>Tipo de visita</label>
                  <select name="tipo_visita" value={form.tipo_visita} onChange={handleFormChange}>
                    {parqueForm?.tiene_cabanas && <option value="cabaña">🏠 Cabaña</option>}
                    <option value="camping">⛺ Camping</option>
                  </select>
                </div>
              </div>

              {formError && <p className="pq-form-error">⚠️ {formError}</p>}

              <div className="pq-form-footer">
                <p className="pq-form-note">Al confirmar recibirás un correo con los detalles de tu reservación a <strong>{user?.email}</strong></p>
                <button type="submit" className="pq-btn-primary pq-btn-submit" disabled={submitting}>
                  {submitting ? <span className="pq-spinner-sm" /> : '✦ Confirmar reservación'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <footer className="pq-footer">
        <p>Festival Internacional de las Luciérnagas 2026 · Tlaxcala & Estado de México</p>
      </footer>
    </div>
  )
}
