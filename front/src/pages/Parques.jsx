import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Button } from '../components/Button'
import { useLocation } from "react-router-dom";
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
  X,
  Lock,
  LogIn,
  CalendarCheck,
  Tent,
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
  Map,
} from 'lucide-react'
import { FiArrowRight, FiSearch } from "react-icons/fi";
import { motion, AnimatePresence } from 'framer-motion'
import Luciernagas1 from '../assets/img/parques/Luciernagas1.jpg'
import Luciernagas2 from '../assets/img/parques/Luciernagas2.jpg'
import img1 from '../assets/img/parques/b1.jpeg'
import img2 from '../assets/img/parques/b2.jpg'
import img3 from '../assets/img/parques/3.1.jpg'
import img4 from '../assets/img/parques/3.2.jpeg'
import img5 from '../assets/img/parques/4.1.jpeg'
import img6 from '../assets/img/parques/4.2.jpg'
import img7 from '../assets/img/parques/5.1.jpeg'
import img8 from '../assets/img/parques/6.1.jpg'
import img9 from '../assets/img/parques/6.2.jpg'
import img10 from '../assets/img/parques/7.jpg'
import img11 from '../assets/img/parques/8.jpg'




/* ─── helpers ──────────────────────────────────────────────── */
const fireflyIcon = (active = false) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width:18px;height:18px;border-radius:9999px;
        background:${active ? '#fde047' : '#facc15'};
        box-shadow:0 0 10px #fde047,0 0 20px #fde047,0 0 35px #fde047;
        border:2px solid white;
        animation:ffpulse 1.5s infinite;
      "></div>
      <style>
        @keyframes ffpulse{
          0%{transform:scale(1);opacity:.8}
          50%{transform:scale(1.25);opacity:1}
          100%{transform:scale(1);opacity:.8}
        }
      </style>`,
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
const isTuesday = (d) => new Date(d + 'T12:00:00').getDay() === 2
const isInSeason = (d) => {
  const m = new Date(d + 'T12:00:00').getMonth() + 1
  return m >= 6 && m <= 8
}

/* parkImages: mapea id → array de imágenes (carrusel) */
const parkImages = {
  1: [Luciernagas1, Luciernagas2],
  2: [img1, img2],
  3: [img3, img4],
  4: [img5, img6],
  5: [img7],
  6: [img8, img9],
  7: [img10],
  8: [img11]
}

const fallback =
  'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80'

/* ─── carrusel ──────────────────────────────────────────────── */
function ImageCarousel({ parkId, alt }) {
  const images = parkImages[parkId] ?? [fallback]
  const [idx, setIdx] = useState(0)
  const prev = (e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length) }
  const next = (e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length) }

  return (
    <div className="relative h-56 overflow-hidden rounded-t-2xl group">
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={images[idx]}
          alt={alt}
          onError={(e) => { e.target.src = fallback }}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* gradiente bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f14]/80 via-transparent to-transparent pointer-events-none" />

      {/* controles – solo si hay más de 1 imagen */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i) }}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${i === idx ? 'bg-yellow-400 w-3' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ─── componente principal ──────────────────────────────────── */
export default function Parques() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [parques, setParques] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)

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

  const selectPark = (p) => {
    if (!user) { navigate('/login'); return }
    setSelected(p)
    setPanelOpen(true)
    setForm((f) => ({ ...f, parque_id: String(p.id), tipo_visita: p.tiene_cabanas ? 'cabana' : 'camping' }))
  }

  const closePanel = () => {
    setPanelOpen(false)
    setTimeout(() => setSelected(null), 300)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setFormError('')
  }
  
  const location = useLocation();

useEffect(() => {
  if (location.hash === "#reservar-form") {
    setTimeout(() => {
      const element = document.getElementById("reservar-form");

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  }
}, [location]);

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
    const parque = parques.find((p) => String(p.id) === String(form.parque_id))
    if (parque && form.num_personas > parque.capacidad_maxima)
      return `Capacidad máxima de este parque: ${parque.capacidad_maxima} personas.`
    if (form.tipo_visita === 'cabana' && parque && !parque.tiene_cabanas)
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

  const activeParques = parques.filter((p) => p.estatus_parque === 'activo')
  const center = activeParques.length
    ? [parseFloat(activeParques[0].latitud), parseFloat(activeParques[0].longitud)]
    : [19.066, -98.76]
  const parqueForm = parques.find((p) => String(p.id) === String(form.parque_id))

  /* ─── render ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#071510] text-[#f0ead6]">

      {/* ── SECCIÓN MAPA ─────────────────────────────────────── */}
      <section className="relative py-16 px-6 overflow-hidden">
        {/* fondo decorativo con contraste */}
<div className="relative max-w-7xl mx-auto">

  <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">

    {/* LADO IZQUIERDO */}
<motion.div
  initial={{ opacity: 0, x: -40 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8 }}
  viewport={{ once: true }}
  className="space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start"
>


      <div>
        <h2 className="text-5xl md:text-6xl xl:text-7xl font-black leading-none tracking-tight">
          <span className="block text-white">
            Explora los
          </span>

          <span
            className="
              block
              bg-gradient-to-r
              from-yellow-300
              via-yellow-400
              to-green-400
              bg-clip-text
              text-transparent
              drop-shadow-[0_0_25px_rgba(250,204,21,0.35)]
            "
          >
            parques
          </span>
        </h2>

        <p className="mt-6 text-lg text-zinc-300 max-w-md leading-relaxed mx-auto lg:mx-0">
          Descubre cada ubicación del Festival Internacional de las
          Luciérnagas y encuentra el destino perfecto para tu próxima
          aventura.
        </p>
      </div>

      <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl border border-green-500/20 bg-green-500/10 text-green-300">
        <Leaf className="w-5 h-5" />
        <span className="font-medium">
          {activeParques.length} parques activos esta temporada
        </span>
      </div>
            <div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 text-yellow-300 text-xs uppercase tracking-[0.3em]">
        <Map className="w-4 h-4" />
        Mapa interactivo
      </div>
      </div>
        {/* LEYENDA */}
  <div className="mt-8 ">
    <p className="text-sm text-white/90 flex gap-2 justify-center lg:justify-start">
      <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_12px_#fde047]" />
      Los puntos amarillos indican parques activos
    </p>
  </div>

    </motion.div>

    {/* LADO DERECHO */}
    
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="
        aspect-square
        overflow-hidden
        rounded-[32px]
        border
        border-yellow-400/20
        shadow-[0_0_60px_rgba(250,204,21,0.12)]
      "
    >
      
      {!loading ? (
        <MapContainer
          center={center}
          zoom={11}
          className="h-full w-full z-0"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; CARTO"
          />

          {selected && (
            <FlyTo
              coords={[
                parseFloat(selected.latitud),
                parseFloat(selected.longitud)
              ]}
            />
          )}

          {activeParques.map((p) => (
            <Marker
              key={p.id}
              position={[
                parseFloat(p.latitud),
                parseFloat(p.longitud)
              ]}
              icon={fireflyIcon(selected?.id === p.id)}
              eventHandlers={{
                click: () => selectPark(p)
              }}
            />
          ))}
        </MapContainer>
      ) : (
        <div className="h-full flex items-center justify-center bg-[#0d2418]">
          <p className="text-zinc-500">Cargando mapa...</p>
        </div>
      )}
    </motion.div>

  </div>

</div>
      </section>

      {/* ── OVERLAY ──────────────────────────────────────────── */}
      <div
        onClick={closePanel}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] transition-all duration-300 ${
          panelOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />

      {/* ── PANEL DETALLES ───────────────────────────────────── */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-[#08120d] border-l border-yellow-500/20 z-[1000] overflow-y-auto transition-transform duration-300 ${
          panelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selected && (
          <>
            <div className="relative h-72 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selected.id}
                  src={(parkImages[selected.id] ?? [fallback])[0]}
                  alt={selected.nombre}
                  onError={(e) => { e.target.src = fallback }}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-[#08120d] to-transparent" />
              <button
                onClick={closePanel}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 border border-white/10 text-white hover:bg-black/70 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {/* tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                  <Leaf className="w-3 h-3" /> Activo
                </span>
                {selected.tiene_cabanas && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
                    <Home className="w-3 h-3" /> Cabañas
                  </span>
                )}
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs">
                  <Tent className="w-3 h-3" /> Camping
                </span>
              </div>

              <h2 className="text-2xl font-medium mb-2">{selected.nombre}</h2>
              <p className="text-zinc-400 mb-6 flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4 text-yellow-500/60" /> {selected.direccion}
              </p>

              {/* info grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: <Clock className="w-3 h-3" />, label: 'Apertura', val: fmt(selected.hora_apertura) },
                  { icon: <Clock className="w-3 h-3" />, label: 'Cierre', val: fmt(selected.hora_cierre) },
                  { icon: <Users className="w-3 h-3" />, label: 'Capacidad', val: `${selected.capacidad_maxima} personas` },
                  { icon: <Calendar className="w-3 h-3" />, label: 'Temporada', val: 'Jun – Ago 2026' },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-3">
                    <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1">{icon} {label}</p>
                    <p className="text-sm font-medium">{val}</p>
                  </div>
                ))}
              </div>

              {/* hospedaje */}
              <div className="space-y-2 mb-6">
                <div className={`rounded-xl border p-3 flex items-center gap-3 ${selected.tiene_cabanas ? 'border-yellow-500/20 bg-yellow-500/8' : 'border-white/8 bg-white/3'}`}>
                  <Home className="w-4 h-4 text-yellow-400/60 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Cabañas</p>
                    <p className="text-xs text-zinc-500">{selected.tiene_cabanas ? 'Disponibles' : 'No disponibles'}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-green-500/20 bg-green-500/8 p-3 flex items-center gap-3">
                  <Tent className="w-4 h-4 text-green-400/60 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Camping</p>
                    <p className="text-xs text-zinc-500">Siempre disponible</p>
                  </div>
                </div>
              </div>

              {/* servicios */}
              {selected.servicios?.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Servicios</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.servicios.map((s, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-lg bg-yellow-500/8 border border-yellow-500/15 text-yellow-300 text-xs">
                        {s.nombre || s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* aviso */}
              <div className="bg-red-500/8 border border-red-500/15 rounded-xl p-3 mb-6 text-sm text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-xs">Sin reservaciones los martes · Solo junio a agosto</span>
              </div>

              {/* cta */}
              <button
                onClick={() => {
                  closePanel()
                  setTimeout(() => {
                    document.getElementById('reservar-form')?.scrollIntoView({ behavior: 'smooth' })
                  }, 300)
                }}
                className="w-full py-3.5 rounded-xl bg-yellow-400 text-black font-medium hover:bg-yellow-300 flex items-center justify-center gap-2 transition text-sm cursor-pointer active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4" /> Reservar este parque
              </button>
            </div>
          </>
        )}
      </aside>

{/* ── SECCIÓN TARJETAS ─────────────────────────────────── */}
<section className="py-20 px-6 bg-gradient-to-b from-[#173d2a] via-[#0b1d15] to-[#050b08]">
  <div className="max-w-7xl mx-auto">

    {/* encabezado centrado */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-14"
    >
      <h2 className="text-4xl md:text-5xl font-light text-white mb-3 tracking-tight">
        Todos los parques
      </h2>
      <p className="text-zinc-300 text-base max-w-lg mx-auto">
        Explora nuestros santuarios de luciérnagas y elige el que más te inspire
      </p>
    </motion.div>

    {/* grid de tarjetas */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activeParques.map((p, index) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08 }}
          className="group"
        >
          <div
            className={`overflow-hidden rounded-2xl border bg-gradient-to-b from-[#183425] to-[#0b1510] flex flex-col transition-all duration-300 ${
              selected?.id === p.id
                ? 'border-yellow-300 shadow-[0_0_30px_rgba(250,204,21,0.18)]'
                : 'border-yellow-400/20 hover:border-yellow-300'
            }`}
          >
            {/* carrusel */}
            <div className="relative">
              <ImageCarousel parkId={p.id} alt={p.nombre} />

              {/* rating badge */}
              <div className="absolute top-3 left-3 bg-[#0a0e0d]/80 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 z-10">
                <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                <span className="text-white text-xs font-medium">
                  {p.rating ?? '4.8'}
                </span>
              </div>

              {/* tipo badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className="px-2.5 py-1 rounded-full bg-black/60 border border-yellow-400/20 text-yellow-300 text-xs">
                  {p.tiene_cabanas ? 'Cabañas + Camping' : 'Camping'}
                </span>
              </div>
            </div>

            {/* contenido */}
            <div className="p-5 flex flex-col flex-1">

              {/* nombre */}
              <h3 className="text-lg font-medium text-white mb-1 group-hover:text-yellow-300 transition-colors">
                {p.nombre}
              </h3>

              {/* ubicación */}
              <div className="flex items-center gap-1 text-zinc-300 text-sm mb-2">
                <MapPin className="w-3.5 h-3.5 text-yellow-400/70" />
                <span>{p.direccion}</span>
              </div>

              {/* descripción */}
              {p.descripcion && (
                <p className="text-zinc-200 text-sm mb-3 line-clamp-2 leading-relaxed">
                  {p.descripcion}
                </p>
              )}

              {/* horario */}
              <div className="flex items-center gap-1 text-zinc-300 text-xs mb-3">
                <Clock className="w-3.5 h-3.5 text-yellow-400/70" />
                <span>
                  {fmt(p.hora_apertura)} – {fmt(p.hora_cierre)}
                </span>
              </div>

              {/* capacidad + tipo hospedaje */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1 text-zinc-200 text-xs">
                  <Users className="w-3.5 h-3.5 text-yellow-400/70" />
                  <span>{p.capacidad_maxima} personas</span>
                </div>

                <div className="w-px h-3.5 bg-white/10" />

                {p.tiene_cabanas && (
                  <div className="flex items-center gap-1 text-yellow-300 text-xs">
                    <Home className="w-3.5 h-3.5" />
                    <span>Cabañas</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-green-300 text-xs">
                  <Tent className="w-3.5 h-3.5" />
                  <span>Camping</span>
                </div>
              </div>

              {/* divider + botón */}
              <div className="mt-auto pt-3 border-t border-yellow-400/10 flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.round(p.rating ?? 4.8)
                          ? 'text-yellow-300 fill-yellow-300'
                          : 'text-zinc-700'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  size="sm"
                  onClick={() => selectPark(p)}
                  className="btn-fancy text-black cursor-pointer"
                >
                  Ver más detalles
                  <FiArrowRight className="h-5 w-5" />
                </Button>
              </div>

            </div>
          </div>
        </motion.div>
      ))}
    </div>

    {/* aviso si no hay parques */}
    {!loading && activeParques.length === 0 && (
      <div className="text-center py-20 text-zinc-500">
        <Leaf className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">
          No hay parques activos por el momento.
        </p>
      </div>
    )}
  </div>
</section>

      {/* ── FORMULARIO ───────────────────────────────────────── */}
      <section id="reservar-form" className="border-t border-yellow-500/10 bg-[#050e08]">
        <div className="max-w-2xl mx-auto px-6 py-16">

          {/* encabezado */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light mb-2 flex items-center justify-center gap-3 text-[#f0ead6] tracking-tight">
              <Sparkles className="text-yellow-400 w-5 h-5" />
              Hacer una reservación
            </h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Solo disponible de junio a agosto</p>
          </div>

          {/* no logueado */}
          {!user ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-[#0a1a10] border border-yellow-500/10 rounded-2xl p-12 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-yellow-400/8 border border-yellow-500/20 flex items-center justify-center mx-auto mb-5">
                <Lock className="w-6 h-6 text-yellow-400/60" />
              </div>
              <h3 className="text-xl font-medium text-[#f0ead6] mb-3">Inicia sesión para reservar</h3>
              <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                Para hacer una reservación necesitas una cuenta.<br />Es rápido y gratis.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-medium text-sm px-7 py-3 rounded-xl transition-colors duration-150 cursor-pointer active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                Iniciar sesión
              </button>
            </motion.div>

          ) : formSuccess ? (
            /* éxito */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a1a10] border border-yellow-500/10 rounded-2xl p-10 text-center"
            >
              <h3 className="text-2xl font-medium mb-3 text-yellow-400">¡Reservación realizada!</h3>
              <p className="text-zinc-400 text-sm mb-8">Se envió una confirmación a {user?.email}</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => setFormSuccess(false)}
                  className="px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-medium text-sm transition-colors cursor-pointer active:scale-[0.98]"
                >
                  Hacer otra reservación
                </button>
                <Link
                  to="/reservar"
                  className="px-6 py-3 rounded-xl border border-yellow-500/20 hover:border-yellow-400/50 text-[#f0ead6] text-sm transition-colors"
                >
                  Ver mis reservaciones
                </Link>
              </div>
            </motion.div>

          ) : (
            /* formulario */
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-[#0a1a10] border border-yellow-500/10 rounded-2xl p-8"
            >
              <form onSubmit={handleReservar} className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="md:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
                    <MapPin className="w-3.5 h-3.5 text-yellow-400/50" /> Parque
                  </label>
                  <select
                    name="parque_id"
                    value={form.parque_id}
                    onChange={handleFormChange}
                    className="w-full bg-[#081310] border border-yellow-500/15 hover:border-yellow-500/30 focus:border-yellow-400/50 rounded-xl px-4 py-3 text-[#f0ead6] text-sm outline-none transition-colors duration-150 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#050e08]">— Selecciona un parque —</option>
                    {activeParques.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#050e08]">{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
                    <Calendar className="w-3.5 h-3.5 text-yellow-400/50" /> Fecha inicio
                  </label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={form.fecha_inicio}
                    min={today()}
                    onChange={handleFormChange}
                    className="w-full bg-[#081310] border border-yellow-500/15 hover:border-yellow-500/30 focus:border-yellow-400/50 rounded-xl px-4 py-3 text-zinc-200 text-sm outline-none transition-colors duration-150 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
                    <CalendarCheck className="w-3.5 h-3.5 text-yellow-400/50" /> Fecha fin
                  </label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={form.fecha_fin}
                    min={form.fecha_inicio || today()}
                    onChange={handleFormChange}
                    className="w-full bg-[#081310] border border-yellow-500/15 hover:border-yellow-500/30 focus:border-yellow-400/50 rounded-xl px-4 py-3 text-zinc-200 text-sm outline-none transition-colors duration-150 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
                    <Users className="w-3.5 h-3.5 text-yellow-400/50" /> Personas
                  </label>
                  <input
                    type="number"
                    name="num_personas"
                    value={form.num_personas}
                    min="1"
                    onChange={handleFormChange}
                    className="w-full bg-[#081310] border border-yellow-500/15 hover:border-yellow-500/30 focus:border-yellow-400/50 rounded-xl px-4 py-3 text-zinc-200 text-sm outline-none transition-colors duration-150"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">
                    <Tent className="w-3.5 h-3.5 text-yellow-400/50" /> Tipo de visita
                  </label>
                  <select
                    name="tipo_visita"
                    value={form.tipo_visita}
                    onChange={handleFormChange}
                    className="w-full bg-[#081310] border border-yellow-500/15 hover:border-yellow-500/30 focus:border-yellow-400/50 rounded-xl px-4 py-3 text-[#f0ead6] text-sm outline-none transition-colors duration-150 appearance-none cursor-pointer"
                  >
                    {parqueForm?.tiene_cabanas && (
                      <option value="cabana" className="bg-[#050e08]">Cabaña</option>
                    )}
                    <option value="camping" className="bg-[#050e08]">Camping</option>
                  </select>
                </div>

                {formError && (
                  <div className="md:col-span-2 bg-red-500/8 border border-red-500/15 rounded-xl p-4 text-red-300 flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="md:col-span-2 mt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-medium py-4 rounded-xl text-sm transition-colors duration-150 cursor-pointer active:scale-[0.99]"
                  >
                    {submitting ? 'Reservando...' : 'Confirmar reservación'}
                    {!submitting && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>

              </form>
            </motion.div>
          )}

        </div>
      </section>

    </div>
  )
}