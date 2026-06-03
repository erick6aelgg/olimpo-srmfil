import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { FireflyDecoration } from "./FireflyEffect";
import { Button } from "./Button";
import {
  MapPin,
  Star,
  Users,
  Clock,
  Home as HomeIcon,
  Tent,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Calendar,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from '../services/api'
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

/* ─── Imágenes del hero (slideshow) ─────────────────────────────── */
const heroSlides = [
  {
    url: "https://images.unsplash.com/photo-1686937378864-38df58d421ef?auto=format&fit=crop&w=1600&q=80",
    label: "Bosque mágico al anochecer",
  },
  {
    url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1600&q=80",
    label: "Naturaleza bajo las estrellas",
  },
  {
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80",
    label: "Senderos iluminados",
  },
];

/* ─── Imágenes para cada parque destacado ────────────────────────── */
// Ajusta estos arrays a las importaciones reales de tu proyecto
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
function ImageCarousel({ images = [], alt }) {
  const urls = images.length > 0 ? images.map(i => i.url) : [fallback]
  const [idx, setIdx] = useState(0)
  const prev = (e) => { e.stopPropagation(); setIdx((i) => (i - 1 + urls.length) % urls.length) }
  const next = (e) => { e.stopPropagation(); setIdx((i) => (i + 1) % urls.length) }

  return (
    <div className="relative h-56 overflow-hidden rounded-t-2xl group">
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={urls[idx]}
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
            {urls.map((_, i) => (
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


/* ─── Formato de hora ────────────────────────────────────────────── */
const fmt = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr < 12 ? "AM" : "PM"}`;
};

/* ─── Mini carrusel para tarjetas ───────────────────────────────── */


/* ─── Partículas de luciérnagas en el hero ───────────────────────── */
function FireflyParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-yellow-300"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0,
            boxShadow: "0 0 8px 2px #fde047",
            animation: `ffglow ${3 + Math.random() * 4}s ${
              Math.random() * 5
            }s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes ffglow {
          0%   { opacity: 0; transform: translateY(0px) scale(1); }
          30%  { opacity: 0.9; }
          60%  { opacity: 0.4; transform: translateY(-18px) scale(1.3); }
          100% { opacity: 0; transform: translateY(-30px) scale(0.8); }
        }
      `}</style>
    </div>
  );
}

/* ─── Componente principal ──────────────────────────────────────── */
export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [parques, setParques] = useState([])
    const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)


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



  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
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
    const parque = parques.find((p) => String(p.id) === String(form.parque_id))
    if (parque && form.num_personas > parque.capacidad_maxima)
      return `Capacidad máxima de este parque: ${parque.capacidad_maxima} personas.`
    if (form.tipo_visita === 'cabana' && parque && !parque.tiene_cabanas)
      return 'Este parque no tiene cabañas disponibles.'
    return null
  }

    const activeParques = parques.filter((p) => 
      p.estatus_parque === 'activo').slice(3,6)

  /* slideshow */
  const [slideIdx, setSlideIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setSlideIdx((i) => (i + 1) % heroSlides.length),
      5000
    );
    return () => clearInterval(t);
  }, []);

  const handleProtectedNav = (ruta) => {
    if (user) {
      navigate(ruta);
    } else {
      navigate("/login");
    }
  };


  return (
    <div className="min-h-screen bg-white">

      {/* ═══════════════════════════════════════════
          HERO — slideshow + luciérnagas + overlays
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-dvh flex items-center justify-center overflow-hidden">

        {/* Slideshow de fondo */}
        <AnimatePresence mode="sync">
          <motion.div
            key={slideIdx}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 z-0"
          >
            <img
              src={heroSlides[slideIdx].url}
              alt={heroSlides[slideIdx].label}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay degradado */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/45 to-black/75" />

        {/* Overlay de color cálido en la zona inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 z-[1] bg-gradient-to-t from-[#05100a]/90 to-transparent" />

        {/* Partículas de luciérnagas */}
        <FireflyParticles />

        {/* Indicadores del slideshow */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === slideIdx
                  ? "w-6 h-2 bg-yellow-400"
                  : "w-2 h-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Contenido centrado */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            {/* Badge de temporada */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 backdrop-blur-sm text-yellow-300 text-xs uppercase tracking-[0.3em] mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Temporada 2026 · Junio – Agosto
            </div>

            {/* Título principal */}
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-black text-white mb-4 leading-none tracking-tight">
              Festival Internacional
            </h1>
            <h1
              className="text-5xl md:text-6xl lg:text-8xl font-black leading-none tracking-tight mb-8"
              style={{
                background:
                  "linear-gradient(90deg, #fde047 0%, #a3e635 60%, #4ade80 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 30px rgba(250,204,21,0.3))",
              }}
            >
              de las Luciérnagas
            </h1>

            <p className="text-lg md:text-xl text-white/75 mb-12 max-w-2xl mx-auto leading-relaxed">
              Descubre la magia de la naturaleza en una experiencia única bajo
              las estrellas. Reserva tu lugar en los santuarios más
              espectaculares de México.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleProtectedNav("/parques")}
                className="inline-flex items-center cursor-pointer justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-base px-8 py-4 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-[0_0_30px_rgba(250,204,21,0.3)]"
              >
                <Leaf className="w-4 h-4" />
                Explorar parques
                <FiArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleProtectedNav("/parques#reservar-form")}
                className="inline-flex items-center cursor-pointer justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-8 py-4 rounded-xl border border-white/25 backdrop-blur-sm transition-all duration-200 active:scale-[0.98]"
              >
                <Calendar className="w-4 h-4" />
                Reservar ahora
              </button>
            </div>

            {/* Estadísticas rápidas */}
            <div className="mt-14 grid grid-cols-3 gap-6 max-w-md mx-auto">
              {[
                { value: "8", label: "Parques" },
                { value: "5K+", label: "Visitantes" },
                { value: "3", label: "Meses" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-black text-yellow-300">{value}</p>
                  <p className="text-xs text-white/50 uppercase tracking-widest mt-0.5">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PARQUES DESTACADOS
          ═══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#05100a] via-[#071510] to-[#0b1d15]">
        <div className="max-w-7xl mx-auto">

          {/* Encabezado llamativo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-400/20 bg-yellow-400/8 text-yellow-300 text-xs uppercase tracking-[0.3em] mb-6">
              <Star className="w-3.5 h-3.5 fill-yellow-300" />
              Selección editorial
            </div>

            <h2 className="text-4xl md:text-6xl font-black leading-none tracking-tight mb-4">
              <span className="block text-white">Parques</span>
              <span
                className="block"
                style={{
                  background:
                    "linear-gradient(90deg, #fde047 0%, #a3e635 55%, #4ade80 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 20px rgba(250,204,21,0.25))",
                }}
              >
                Destacados
              </span>
            </h2>

            <p className="text-zinc-400 text-base max-w-lg mx-auto">
              Explora nuestros santuarios más populares de luciérnagas y elige
              el que más te inspire
            </p>
          </motion.div>

          {/* Grid de 3 tarjetas */}
  <div className="max-w-7xl mx-auto">

    {/* encabezado centrado */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-14"
    >

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
              <ImageCarousel images={p.imagenes} alt={p.nombre} />

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
                    <HomeIcon className="w-3.5 h-3.5" />
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
                  onClick={() => navigate("/parques")}
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

          {/* CTA para ver todos */}
          <div className="text-center mt-12">
            <Button
              onClick={() => handleProtectedNav("/parques")}
              size="lg"
              variant="outline"
              className="btn-style700 cursor-pointer"
            >
              Ver todos los parques
              <FiArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA FINAL
          ═══════════════════════════════════════════ */}
      <section className="py-24 px-4 relative overflow-hidden bg-[#050e08]">
        <FireflyDecoration />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4 tracking-tight">
              ¿Listo para la Aventura Nocturna?
            </h2>
            <p className="text-zinc-400 text-lg mb-10">
              Únete a miles de visitantes que han experimentado la magia de las
              luciérnagas. Temporada limitada: Junio – Agosto 2026.
            </p>
            <Button
              onClick={() => handleProtectedNav("/parques#reservar-form")}
              size="lg"
              className="btn-fancy px-12 py-3 uppercase tracking-widest text-white hover:text-black cursor-pointer"
            >
              Reserva Ahora
              <FiArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

    </div>
  );
};