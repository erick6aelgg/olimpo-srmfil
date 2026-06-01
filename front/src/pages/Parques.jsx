import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  MapPin,
  Users,
  Clock,
  Home,
  Leaf,
  Sparkles,
  Eye,
  Calendar,
  AlertTriangle,
  X
} from 'lucide-react'

const fireflyIcon = (active = false) =>
  L.divIcon({
    className: '',
    html: `
      <div
        style="
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: ${active ? '#fde047' : '#facc15'};
          box-shadow:
            0 0 10px #fde047,
            0 0 20px #fde047,
            0 0 35px #fde047;
          border: 2px solid white;
          animation: pulse 1.5s infinite;
        "
      ></div>

      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
      </style>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
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
const isTuesday = (dateStr) => new Date(dateStr + 'T12:00:00').getDay() === 2

const isInSeason = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00')  
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
    setForm(f => ({ ...f, parque_id: String(p.id), tipo_visita: p.tiene_cabanas ? 'cabana' : 'camping' }))
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
    if (form.tipo_visita === 'cabana' && parqueSesleccionado && !parqueSeleccionado.tiene_cabanas)
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
        usuario: user.id,
        parque: parseInt(form.parque_id),
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        numero_personas: parseInt(form.num_personas),
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

  const parqueForm = parques.find(p => String(p.id) === String(form.parque_id))

  // Función manejadora para cuando una imagen por ID de parque no se encuentra
  const handleImageError = (e) => {
    e.target.onerror = null; 
    e.target.src = "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80"; // Imagen de respaldo limpia
  }

  return (
    <div className="min-h-screen bg-[#071510] text-[#f0ead6]">
  
      {/* MAPA */}
      <section className="max-w-7xl mx-auto px-6 py-1">
  
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="text-yellow-400 w-8 h-8" /> Mapa interactivo
          </h2>
  
          <span className="px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-sm">
            {activeParques.length} parques activos
          </span>
        </div>
  
        <div className="h-[500px] overflow-hidden rounded-3xl border border-yellow-500/20 shadow-2xl z-0">
          {!loading ? (
            <MapContainer center={center} zoom={11} className="h-full w-full z-0">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; CARTO'
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
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-zinc-400">Cargando parques...</p>
            </div>
          )}
        </div>
      </section>
          
      {/* OVERLAY */}
      <div
        onClick={closePanel}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] transition-all duration-300 ${
          panelOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />

      {/* PANEL DETALLES */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-[#08120d] border-l border-yellow-500/20 z-[1000] overflow-y-auto transition-transform duration-300 ${
          panelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selected && (
          <>
            {/* IMAGEN DE PANEL POR ID */}
            <div className="relative h-72 overflow-hidden">
              <img
                src={`/images/parks/${selected.id}.jpg`}
                alt={selected.nombre}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#08120d] to-transparent" />

              <button
                onClick={closePanel}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 border border-white/10 text-white hover:bg-black/70 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CONTENIDO */}
            <div className="p-6">

              {/* TAGS */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                  <Leaf className="w-3 h-3" /> Activo
                </span>

                {selected.tiene_cabanas && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
                    <Home className="w-3 h-3" /> Cabañas
                  </span>
                )}

                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs">
                  ⛺ Camping
                </span>
              </div>

              {/* TITULO */}
              <h2 className="text-3xl font-bold mb-3">
                {selected.nombre}
              </h2>

              <p className="text-zinc-400 mb-6 flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4 text-yellow-500/60" /> {selected.direccion}
              </p>

              {/* INFO */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Apertura
                  </p>
                  <p className="font-semibold">{fmt(selected.hora_apertura)}</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Cierre
                  </p>
                  <p className="font-semibold">{fmt(selected.hora_cierre)}</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Capacidad
                  </p>
                  <p className="font-semibold">{selected.capacidad_maxima} personas</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Temporada
                  </p>
                  <p className="font-semibold">Jun – Ago 2026</p>
                </div>
              </div>

              {/* SERVICIOS */}
              {selected.servicios?.length > 0 && (
                <div className="mb-8">
                  <p className="text-sm text-zinc-400 mb-3">Servicios</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.servicios.map((s, i) => (
                      <span
                        key={i}
                        className="px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm"
                      >
                        {s.nombre || s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* HOSPEDAJE */}
              <div className="space-y-3 mb-8">
                <div className={`rounded-2xl border p-4 flex items-center justify-between ${
                  selected.tiene_cabanas ? 'border-yellow-500/20 bg-yellow-500/10' : 'border-white/10 bg-white/5'
                }`}>
                  <div>
                    <p className="font-semibold flex items-center gap-1">
                      <Home className="w-4 h-4" /> Cabañas
                    </p>
                    <p className="text-sm text-zinc-400">
                      {selected.tiene_cabanas ? 'Disponible' : 'No disponible'}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold flex items-center gap-1">
                      <Leaf className="w-4 h-4" /> Camping
                    </p>
                    <p className="text-sm text-zinc-400">Siempre disponible</p>
                  </div>
                </div>
              </div>

              {/* NOTA */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8 text-sm text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>No hay reservaciones los martes · Disponible solo de junio a agosto</span>
              </div>

              {/* BOTON */}
              <button
                onClick={() => {
                  closePanel()
                  setTimeout(() => {
                    document.getElementById('reservar-form')?.scrollIntoView({ behavior: 'smooth' })
                  }, 300)
                }}
                className="w-full py-4 rounded-2xl bg-yellow-400 text-black font-bold hover:bg-yellow-300 flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-5 h-5" /> Reservar este parque
              </button>
            </div>
          </>
        )}
      </aside>   

      {/* TARJETAS */}
      <section className="max-w-7xl mx-auto px-6 pb-10">
  
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Leaf className="text-green-400 w-8 h-8" /> Todos los parques
        </h2>
  
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
  
          {activeParques.map((p) => (
            <div
              key={p.id}
              className={`overflow-hidden rounded-3xl border transition-all duration-300 bg-[#0d2418] flex flex-col justify-between ${
                selected?.id === p.id
                  ? 'border-yellow-400 shadow-yellow-500/20 shadow-2xl'
                  : 'border-yellow-500/10 hover:border-yellow-400/40'
              }`}
            >
  
              {/* IMAGEN DE LA TARJETA POR ID */}
              <div className="h-52 overflow-hidden relative">
                <img
                  src={`/images/parks/${p.id}.jpg`}
                  alt={p.nombre}
                  onError={handleImageError}
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
  
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 text-yellow-400 text-xs border border-yellow-500/20">
                  {p.tiene_cabanas ? 'Cabañas + Camping' : 'Camping'}
                </span>
              </div>
  
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">{p.nombre}</h3>
    
                  <p className="text-zinc-400 text-sm mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {p.direccion}
                  </p>
    
                  <p className="text-zinc-400 text-sm mb-4 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" /> {fmt(p.hora_apertura)} – {fmt(p.hora_cierre)}
                  </p>
                </div>
  
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-sm text-zinc-400 flex items-center gap-1">
                    <Users className="w-4 h-4 text-zinc-500" /> {p.capacidad_maxima} personas
                  </span>
  
                  {/* BOTÓN DE DETALLES */}
                  <button
                    onClick={() => selectPark(p)}
                    className="flex items-center gap-1 text-sm font-semibold bg-yellow-400 text-black px-4 py-2 rounded-xl hover:bg-yellow-300 active:scale-95 transition-all"
                  >
                    <Eye className="w-4 h-4" /> Ver detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
  
      {/* FORMULARIO */}
      <section id="reservar-form" className="border-t border-yellow-500/10 bg-[#050e08]">
  
        <div className="max-w-4xl mx-auto px-6 py-16">
  
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
              <Sparkles className="text-yellow-400 w-8 h-8" /> Hacer una reservación
            </h2>
            <p className="text-zinc-400">Solo disponible de junio a agosto</p>
          </div>
  
          {formSuccess ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-10 text-center">
              <h3 className="text-3xl font-bold mb-4 text-yellow-400">¡Reservación realizada!</h3>
              <p className="text-zinc-300 mb-6">Se envió una confirmación a {user?.email}</p>
  
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => setFormSuccess(false)}
                  className="px-6 py-3 rounded-xl bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition"
                >
                  Hacer otra reservación
                </button>
  
                <Link
                  to="/reservar"
                  className="px-6 py-3 rounded-xl border border-yellow-500/20 hover:border-yellow-400 transition"
                >
                  Ver mis reservaciones
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReservar} className="grid grid-cols-1 md:grid-cols-2 gap-6">
  
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm text-zinc-400">Parque</label>
                <select
                  name="parque_id"
                  value={form.parque_id}
                  onChange={handleFormChange}
                  className="w-full bg-[#0d2418] border border-yellow-500/20 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 text-[#f0ead6]"
                >
                  <option value="" className="bg-[#050e08]">— Selecciona un parque —</option>
                  {activeParques.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#050e08]">
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
  
              <div>
                <label className="block mb-2 text-sm text-zinc-400">Fecha inicio</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={form.fecha_inicio}
                  min={today()}
                  onChange={handleFormChange}
                  className="w-full bg-white/5 border border-yellow-500/20 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-yellow-400"
                />
              </div>
  
              <div>
                <label className="block mb-2 text-sm text-zinc-400">Fecha fin</label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={form.fecha_fin}
                  min={form.fecha_inicio || today()}
                  onChange={handleFormChange}
                  className="w-full bg-white/5 border border-yellow-500/20 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-yellow-400"
                />
              </div>
  
              <div>
                <label className="block mb-2 text-sm text-zinc-400">Personas</label>
                <input
                  type="number"
                  name="num_personas"
                  value={form.num_personas}
                  min="1"
                  onChange={handleFormChange}
                  className="w-full bg-white/5 border border-yellow-500/20 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:border-yellow-400"
                />
              </div>
  
              <div>
                <label className="block mb-2 text-sm text-zinc-400">Tipo</label>
                <select
                  name="tipo_visita"
                  value={form.tipo_visita}
                  onChange={handleFormChange}
                  className="w-full bg-[#0d2418] border border-yellow-500/20 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400 text-[#f0ead6]"
                >
                  {parqueForm?.tiene_cabanas && (
                    <option value="cabana" className="bg-[#050e08]">Cabaña</option>
                  )}
                  <option value="camping" className="bg-[#050e08]">Camping</option>
                </select>
              </div>
  
              {formError && (
                <div className="md:col-span-2 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 flex items-start gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
  
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-4 rounded-2xl bg-yellow-400 text-black font-bold hover:bg-yellow-300 flex items-center gap-2 transition"
                >
                  {submitting ? 'Reservando...' : 'Confirmar reservación'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}