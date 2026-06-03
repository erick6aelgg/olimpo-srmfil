import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Home,
  Users,
  Mail,
  Leaf,
  AlertTriangle,
  X,
  Loader2,
  CalendarDays,
  CalendarCheck,
  Hash,
  Tent,
  CheckCircle2,
  XCircle,
  Clock3,
  ArrowRight,
  BookOpen,
} from 'lucide-react'

/* ─── helpers ────────────────────────────────────────────────────── */
const fmtDate = (d) => {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const diffDays = (a, b) => {
  const d1 = new Date(a)
  const d2 = new Date(b)
  return Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)))
}

const STATUS_META = {
  activa: {
    label: 'Activa',
    icon: <Clock3 className="w-3 h-3" />,
    pill: 'border border-green-500/25 bg-green-500/10 text-green-400',
  },
  cancelada: {
    label: 'Cancelada',
    icon: <XCircle className="w-3 h-3" />,
    pill: 'border border-red-500/20 bg-red-500/8 text-red-400',
  },
  completada: {
    label: 'Completada',
    icon: <CheckCircle2 className="w-3 h-3" />,
    pill: 'border border-yellow-500/20 bg-yellow-500/8 text-yellow-400',
  },
}

function StatusPill({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.activa
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${meta.pill}`}>
      {meta.icon}
      {meta.label}
    </span>
  )
}

/* ─── Tarjeta de reservación ─────────────────────────────────────── */
function ReservationCard({ r, onCancel, dimmed = false }) {
  const estado = r.estatus || r.estado || 'activa'
  const nights = diffDays(r.fecha_inicio, r.fecha_fin)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-2xl border bg-gradient-to-b from-[#0f2318] to-[#0a1510] flex flex-col transition-all duration-300 ${
        dimmed
          ? 'border-yellow-400/8 opacity-60'
          : 'border-yellow-400/15 hover:border-yellow-400/30'
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 p-6 pb-4">
        <div className="flex items-start gap-4">
          {/* Ícono de tipo */}
          <div className="w-11 h-11 rounded-xl bg-yellow-400/8 border border-yellow-400/15 flex items-center justify-center shrink-0 mt-0.5">
            {r.tipo_visita === 'cabana' ? (
              <Home className="w-5 h-5 text-yellow-300/70" />
            ) : (
              <Tent className="w-5 h-5 text-green-300/70" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#f0ead6] leading-tight mb-1">
              {r.parque_nombre || 'Parque'}
            </h3>
            <p className="text-xs text-zinc-500 capitalize">
              {r.tipo_visita === 'cabana' ? 'Cabaña' : 'Camping'} &middot; {nights}{' '}
              {nights === 1 ? 'noche' : 'noches'}
            </p>
          </div>
        </div>
        <StatusPill status={estado} />
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-yellow-400/8" />

      {/* Info grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6 py-5">
        {[
          {
            icon: <CalendarDays className="w-3.5 h-3.5 text-yellow-400/50" />,
            label: 'Entrada',
            value: fmtDate(r.fecha_inicio),
          },
          {
            icon: <CalendarCheck className="w-3.5 h-3.5 text-yellow-400/50" />,
            label: 'Salida',
            value: fmtDate(r.fecha_fin),
          },
          {
            icon: <Users className="w-3.5 h-3.5 text-yellow-400/50" />,
            label: 'Personas',
            value: `${r.numero_personas} personas`,
          },
          {
            icon: <Hash className="w-3.5 h-3.5 text-yellow-400/50" />,
            label: 'Folio',
            value: `#${r.id}`,
          },
        ].map(({ icon, label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-yellow-400/8 bg-yellow-400/4 px-4 py-3 flex flex-col gap-1"
          >
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
              {icon}
              {label}
            </span>
            <span className="text-sm font-medium text-[#e8dfc8] leading-snug">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Footer — solo en activas */}
      {!dimmed && (
        <>
          <div className="mx-6 h-px bg-yellow-400/8" />
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            <p className="flex items-center gap-1.5 text-xs text-zinc-600">
              <Mail className="w-3.5 h-3.5" />
              Confirmación enviada a tu correo
            </p>
            <button
              onClick={() => onCancel(r)}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/20 px-4 py-2 text-xs text-red-400 transition-all hover:border-red-500/40 hover:bg-red-500/8 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancelar reservación
            </button>
          </div>
        </>
      )}
    </motion.div>
  )
}

/* ─── Componente principal ───────────────────────────────────────── */
export default function MisReservaciones() {
  const { user } = useAuth()
  const navigate = useNavigate();

  const [reservaciones, setReservaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelMsg, setCancelMsg] = useState('')

  const fetchReservaciones = () => {
    if (!user?.id) return
    setLoading(true)
    api
      .get(`/api/reservations/user/${user.id}/`)
      .then(({ data }) =>
        setReservaciones(Array.isArray(data) ? data : data.results || [])
      )
      .catch(() => setError('No se pudieron cargar tus reservaciones.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchReservaciones()
  }, [user])

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

  const activas = reservaciones.filter(
    (r) => (r.estatus || r.estado) === 'activa'
  )
  const historial = reservaciones.filter((r) => {
    const e = r.estatus || r.estado
    return e && e !== 'activa'
  })

  return (
    <div className="min-h-screen bg-[#05100a] text-[#e8dfc8]">
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12">

        {/* ── PAGE HEADER ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-400/20 bg-yellow-400/8 text-yellow-300 text-xs uppercase tracking-[0.3em] mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            Festival de las Luciérnagas 2026
          </div>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black leading-none tracking-tight mb-3">
                <span className="block text-white">Mis</span>
                <span
                  className="block"
                  style={{
                    background:
                      'linear-gradient(90deg, #fde047 0%, #a3e635 55%, #4ade80 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Reservaciones
                </span>
              </h1>
              <p className="text-sm text-zinc-500">
                Gestiona tus visitas al festival
              </p>
            </div>

            <button
              onClick= {() => navigate("/parques#reservar-form")}
              className="inline-flex cursor-pointer items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-[0_0_24px_rgba(250,204,21,0.2)]"
            >
              <Sparkles className="w-4 h-4" />
              Nueva reservación
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* ── ALERT DE ÉXITO ──────────────────────────────── */}
        <AnimatePresence>
          {cancelMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-green-500/20 bg-green-500/8 px-5 py-4 text-sm text-green-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{cancelMsg}</span>
              </div>
              <button
                onClick={() => setCancelMsg('')}
                className="opacity-60 hover:opacity-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ERROR ───────────────────────────────────────── */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-5 py-4 text-sm text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ── STATS ───────────────────────────────────────── */}
        {!loading && reservaciones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-3 gap-4 mb-10"
          >
            {[
              { value: reservaciones.length, label: 'Total', color: 'text-yellow-300' },
              { value: activas.length, label: 'Activas', color: 'text-green-400' },
              { value: historial.length, label: 'Historial', color: 'text-zinc-400' },
            ].map(({ value, label, color }) => (
              <div
                key={label}
                className="rounded-2xl border border-yellow-400/10 bg-yellow-400/4 px-6 py-5 text-center"
              >
                <p className={`text-3xl font-black ${color}`}>{value}</p>
                <p className="mt-1 text-xs text-zinc-600 uppercase tracking-[0.2em]">
                  {label}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── LOADING ─────────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-24 text-zinc-600">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
            <p className="text-sm">Cargando reservaciones...</p>
          </div>
        )}

        {/* ── ACTIVAS ─────────────────────────────────────── */}
        {!loading && activas.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-yellow-400/8">
              <Clock3 className="w-4 h-4 text-yellow-400/60" />
              <h2 className="text-lg font-medium text-[#f0ead6]">
                Reservaciones activas
              </h2>
              <span className="ml-auto px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                {activas.length}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {activas.map((r) => (
                <ReservationCard
                  key={r.id}
                  r={r}
                  onCancel={setCancelTarget}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── HISTORIAL ───────────────────────────────────── */}
        {!loading && historial.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-yellow-400/8">
              <CheckCircle2 className="w-4 h-4 text-zinc-600" />
              <h2 className="text-lg font-medium text-[#f0ead6]">Historial</h2>
              <span className="ml-auto px-2.5 py-0.5 rounded-full bg-white/5 border border-white/8 text-zinc-500 text-xs">
                {historial.length}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {historial.map((r) => (
                <ReservationCard
                  key={r.id}
                  r={r}
                  onCancel={() => {}}
                  dimmed
                />
              ))}
            </div>
          </section>
        )}

        {/* ── EMPTY ───────────────────────────────────────── */}
        {!loading && reservaciones.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-dashed border-yellow-400/10 bg-yellow-400/3 p-16 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-yellow-400/8 border border-yellow-400/15 flex items-center justify-center mx-auto mb-5">
              <Leaf className="w-7 h-7 text-yellow-400/40" />
            </div>
            <p className="text-sm text-zinc-500 mb-2">
              Aún no tienes reservaciones
            </p>
            <p className="text-xs text-zinc-700 mb-8">
              Explora los parques y vive la magia de las luciérnagas
            </p>
            <Link
              to="/parques"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold text-sm px-7 py-3 rounded-xl transition-all duration-200 active:scale-[0.98]"
            >
              <Leaf className="w-4 h-4" />
              Explorar parques
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

      </main>

      {/* ── MODAL DE CANCELACIÓN ────────────────────────── */}
      <AnimatePresence>
        {cancelTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-[420px] rounded-2xl border border-yellow-400/15 bg-[#0a1c10] p-8 text-center shadow-[0_40px_80px_rgba(0,0,0,0.7)]"
            >
              {/* Ícono de alerta */}
              <div className="w-14 h-14 rounded-full bg-red-500/8 border border-red-500/15 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>

              <h3 className="text-2xl font-bold text-[#f0ead6] mb-2">
                Cancelar reservación
              </h3>
              <p className="text-sm text-zinc-500 mb-1 leading-relaxed">
                ¿Seguro que deseas cancelar tu visita a{' '}
                <span className="text-[#f0ead6]">
                  {cancelTarget.parque_nombre || 'este parque'}
                </span>
                ?
              </p>
              <p className="text-xs text-red-400/60 mb-8">
                Esta acción no se puede deshacer.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setCancelTarget(null)}
                  className="flex items-center gap-1.5 rounded-xl border border-yellow-400/15 px-6 py-3 text-sm text-zinc-400 hover:border-yellow-400/30 hover:text-[#e8dfc8] transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  No, mantener
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-6 py-3 text-sm text-red-400 hover:bg-red-500/18 hover:border-red-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
                >
                  {cancelling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {cancelling ? 'Cancelando...' : 'Sí, cancelar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
