import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './Dashboard.css'

/* ── Custom firefly marker icon ─────────────────────── */
const fireflyIcon = (active = false) =>
  L.divIcon({
    className: '',
    html: `<div class="map-marker ${active ? 'map-marker--active' : ''}">
             <div class="marker-core"></div>
             <div class="marker-ring"></div>
           </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })

/* ── Fly to selected park ───────────────────────────── */
function FlyTo({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, 13, { duration: 1.2 })
  }, [coords, map])
  return null
}

/* ── Format time ────────────────────────────────────── */
const fmt = (t) => {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hr = parseInt(h)
  return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [parques, setParques] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const menuRef = useRef(null)

  /* fetch parks */
  useEffect(() => {
    api.get('/api/parks/')
      .then(({ data }) => setParques(Array.isArray(data) ? data : data.results || []))
      .catch(() => setParques([]))
      .finally(() => setLoading(false))
  }, [])

  /* close menu on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectPark = (p) => {
    setSelected(p)
    setPanelOpen(true)
  }

  const closePanel = () => {
    setPanelOpen(false)
    setTimeout(() => setSelected(null), 300)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || '?'
    : '?'

  const activeParques = parques.filter((p) => p.estatus_parque === 'activo')
  const center = activeParques.length
    ? [parseFloat(activeParques[0].latitud), parseFloat(activeParques[0].longitud)]
    : [19.3, -98.2]

  return (
    <div className="db-root">

      {/* ── Header ───────────────────────────────────── */}
      <header className="db-header">
        <Link to="/" className="db-logo">
          <span className="db-logo-icon">✦</span>
          <span className="db-logo-text">Luciérnagas <em>2026</em></span>
        </Link>

        <nav className="db-nav">
          <a href="#inicio" className="db-nav-link">Inicio</a>
          <a href="#parques" className="db-nav-link">Parques</a>
          <a href="#reservar" className="db-nav-link">Reservar</a>
        </nav>

        <div className="db-user" ref={menuRef}>
          <button className="db-avatar" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú de usuario">
            <span>{initials}</span>
          </button>
          <div className={`db-dropdown ${menuOpen ? 'db-dropdown--open' : ''}`}>
            <div className="db-dropdown-header">
              <p className="db-dropdown-name">{user?.first_name} {user?.last_name}</p>
              <p className="db-dropdown-email">{user?.email}</p>
            </div>
            <Link to="/mis-reservaciones" className="db-dropdown-item" onClick={() => setMenuOpen(false)}>
              Mis reservaciones
            </Link>
            <button className="db-dropdown-item db-dropdown-item--danger" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* ── Welcome bar ──────────────────────────────── */}
      <section className="db-welcome">
        <div className="db-welcome-inner">
          <div>
            <h1 className="db-welcome-title">
              Hola, <span className="db-accent">{user?.first_name || 'explorador'}</span> ✦
            </h1>
            <p className="db-welcome-sub">Encuentra tu parque perfecto y vive la magia de las luciérnagas</p>
          </div>
          <div className="db-stats">
            <div className="db-stat">
              <span className="db-stat-num">{activeParques.length}</span>
              <span className="db-stat-label">Parques activos</span>
            </div>
            <div className="db-stat">
              <span className="db-stat-num">{parques.filter(p => p.tiene_cabanas).length}</span>
              <span className="db-stat-label">Con cabañas</span>
            </div>
            <div className="db-stat">
              <span className="db-stat-num">Jun–Ago</span>
              <span className="db-stat-label">Temporada 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main content ─────────────────────────────── */}
      <main className="db-main">

        {/* Map section */}
        <section className="db-map-section">
          <div className="db-section-head">
            <h2 className="db-section-title">Mapa de parques</h2>
            <p className="db-section-sub">Selecciona un marcador para ver los detalles</p>
          </div>

          <div className="db-map-wrap">
            {!loading && (
              <MapContainer
                center={center}
                zoom={10}
                className="db-leaflet-map"
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                {selected && (
                  <FlyTo coords={[parseFloat(selected.latitud), parseFloat(selected.longitud)]} />
                )}
                {activeParques.map((p) => (
                  <Marker
                    key={p.id}
                    position={[parseFloat(p.latitud), parseFloat(p.longitud)]}
                    icon={fireflyIcon(selected?.id === p.id)}
                    eventHandlers={{ click: () => selectPark(p) }}
                  />
                ))}
              </MapContainer>
            )}
            {loading && (
              <div className="db-map-loading">
                <span className="db-spinner" />
                <p>Cargando parques…</p>
              </div>
            )}
          </div>
        </section>

        {/* Parks grid */}
        <section className="db-parks-section">
          <div className="db-section-head">
            <h2 className="db-section-title">Parques disponibles</h2>
            <span className="db-badge">{activeParques.length} activos</span>
          </div>

          {loading ? (
            <div className="db-cards-loading">
              {[1, 2, 3].map(i => <div key={i} className="db-card-skeleton" />)}
            </div>
          ) : activeParques.length === 0 ? (
            <div className="db-empty">No hay parques activos por el momento.</div>
          ) : (
            <div className="db-cards">
              {activeParques.map((p) => (
                <button
                  key={p.id}
                  className={`db-card ${selected?.id === p.id ? 'db-card--active' : ''}`}
                  onClick={() => selectPark(p)}
                >
                  <div className="db-card-img">
                    {p.imagenes?.find(i => i.es_principal)
                      ? <img src={p.imagenes.find(i => i.es_principal).url} alt={p.nombre} />
                      : <div className="db-card-img-placeholder">✦</div>
                    }
                    <div className="db-card-badge">
                      {p.tiene_cabanas ? 'Cabañas' : 'Solo camping'}
                    </div>
                  </div>
                  <div className="db-card-body">
                    <h3 className="db-card-name">{p.nombre}</h3>
                    <p className="db-card-addr">{p.direccion}</p>
                    <p className="db-card-hours">{fmt(p.hora_apertura)} – {fmt(p.hora_cierre)}</p>
                    <div className="db-card-footer">
                      <span className="db-card-cap">Cap. {p.capacidad_maxima}</span>
                      <span className="db-card-cta">Ver detalles →</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── Detail panel ─────────────────────────────── */}
      <div className={`db-panel-overlay ${panelOpen ? 'db-panel-overlay--open' : ''}`} onClick={closePanel} />
      <aside className={`db-panel ${panelOpen ? 'db-panel--open' : ''}`}>
        {selected && (
          <>
            <div className="db-panel-img">
              {selected.imagenes?.find(i => i.es_principal)
                ? <img src={selected.imagenes.find(i => i.es_principal).url} alt={selected.nombre} />
                : <div className="db-panel-img-placeholder">✦</div>
              }
              <button className="db-panel-close" onClick={closePanel} aria-label="Cerrar">✕</button>
              <div className="db-panel-img-overlay" />
            </div>

            <div className="db-panel-body">
              <div className="db-panel-tags">
                <span className="db-tag db-tag--green">Activo</span>
                {selected.tiene_cabanas && <span className="db-tag db-tag--yellow">Cabañas</span>}
                <span className="db-tag db-tag--gray">Camping</span>
              </div>

              <h2 className="db-panel-title">{selected.nombre}</h2>
              <p className="db-panel-addr">{selected.direccion}</p>

              <div className="db-panel-info-grid">

                <div className="db-info-item">
                    <span className="db-info-label">Horario</span>
                    <span className="db-info-val">
                    {fmt(selected.hora_apertura)} {fmt(selected.hora_cierre)}
                    </span>
                </div>

                <div className="db-info-item">
                    <span className="db-info-label">Dirección</span>
                    <span className="db-info-val">
                    {selected.direccion}
                    </span>
                </div>

                <div className="db-info-item">
                    <span className="db-info-label">Zona de camping</span>
                    <span className="db-info-val">
                    {selected.tiene_camping ? 'Disponible' : 'No disponible'}
                    </span>
                </div>

                <div className="db-info-item">
                    <span className="db-info-label">Cabañas</span>
                    <span className="db-info-val">
                    {selected.numero_cabanas || 0} disponibles
                    </span>
                </div>

            </div>

              <div className="db-services">
  <h3 className="db-services-title">Servicios disponibles</h3>

  <ul className="db-services-list">
    {selected.tiene_camping && (
      <li> Zona de camping</li>
    )}

    {selected.tiene_cabanas && (
      <li> {selected.numero_cabanas} cabañas</li>
    )}

    <li> Sanitarios</li>
    <li> Estacionamiento</li>
    <li> Área recreativa</li>
  </ul>
</div>

<p className="db-panel-description">
  {selected.descripcion}
</p>

              {selected.imagenes?.length > 0 && (
                <div className="db-panel-gallery">
                  <p className="db-gallery-label">Galería</p>
                  <div className="db-gallery-row">
                    {selected.imagenes.slice(0, 4).map((img, i) => (
                      <img key={i} src={img.url} alt={`Foto ${i + 1}`} className="db-gallery-thumb" />
                    ))}
                  </div>
                </div>
              )}

              <div className="db-panel-actions">
                <button
                  className="db-btn-primary"
                  onClick={() => navigate(`/reservar/${selected.id}`)}
                >
                  ✦ Reservar ahora
                </button>
                <button className="db-btn-secondary" onClick={closePanel}>
                  Cancelar
                </button>
              </div>

              <p className="db-panel-note">
                Las reservaciones solo están disponibles de junio a agosto. No se permiten reservas los martes.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}