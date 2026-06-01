import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  Sparkles,
  Home,
  Users,
  Mail,
  Leaf,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react'

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

const STATUS_LABEL = {
  activa: 'Activa',
  cancelada: 'Cancelada',
  completada: 'Completada',
}

const STATUS_CLASS = {
  activa:
    'border border-[rgba(30,160,80,.25)] bg-[rgba(30,160,80,.15)] text-[#6de89a]',
  cancelada:
    'border border-[rgba(240,80,80,.2)] bg-[rgba(240,80,80,.1)] text-[#f07070]',
  completada:
    'border border-[rgba(245,194,0,.2)] bg-[rgba(245,194,0,.1)] text-[#f5c200]',
}

export default function MisReservaciones() {
  const { user } = useAuth()

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

  const activas = reservaciones.filter((r) => {
    const estado = r.estatus || r.estado
    return estado === 'activa'
  })

  const historial = reservaciones.filter((r) => {
    const estado = r.estatus || r.estado
    return estado && estado !== 'activa'
  })

  return (
    <div className="min-h-screen bg-[#05100a] font-sans text-[#e8dfc8]">
      <main className="mx-auto max-w-[900px] px-8 py-10 md:px-4">

        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="mb-1 font-serif text-4xl font-semibold text-[#f0ead6]">
              Mis reservaciones
            </h1>
            <p className="text-sm text-[rgba(180,200,185,.5)]">
              Gestiona tus visitas al festival
            </p>
          </div>
          <Link
            to="/parques"
            className="inline-flex items-center gap-2 rounded-xl bg-[#f5c200] px-6 py-3 text-sm font-semibold text-[#050e08] shadow-[0_4px_16px_rgba(245,194,0,.25)] transition hover:-translate-y-[1px] hover:bg-[#ffd028]"
          >
            <Sparkles size={14} />
            Nueva reservación
          </Link>
        </div>

        {/* ALERT */}
        {cancelMsg && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-[rgba(30,160,80,.25)] bg-[rgba(30,160,80,.12)] px-5 py-4 text-sm text-[#6de89a]">
            <span>{cancelMsg}</span>
            <button
              onClick={() => setCancelMsg('')}
              className="opacity-70 transition hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-[rgba(240,80,80,.25)] bg-[rgba(240,80,80,.1)] px-5 py-4 text-sm text-[#f07070]">
            {error}
          </div>
        )}

        {/* STATS */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="min-w-[90px] rounded-2xl border border-[rgba(245,194,0,.12)] bg-[rgba(245,194,0,.05)] px-6 py-4 text-center">
            <p className="text-3xl font-semibold text-[#f5c200]">
              {reservaciones.length}
            </p>
            <span className="mt-1 block text-xs text-[rgba(180,200,185,.45)]">
              Total
            </span>
          </div>
          <div className="min-w-[90px] rounded-2xl border border-[rgba(245,194,0,.12)] bg-[rgba(245,194,0,.05)] px-6 py-4 text-center">
            <p className="text-3xl font-semibold text-[#6de89a]">
              {activas.length}
            </p>
            <span className="mt-1 block text-xs text-[rgba(180,200,185,.45)]">
              Activas
            </span>
          </div>
          <div className="min-w-[90px] rounded-2xl border border-[rgba(245,194,0,.12)] bg-[rgba(245,194,0,.05)] px-6 py-4 text-center">
            <p className="text-3xl font-semibold text-[#f5c200]">
              {historial.length}
            </p>
            <span className="mt-1 block text-xs text-[rgba(180,200,185,.45)]">
              Historial
            </span>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-16 text-[rgba(180,200,185,.5)]">
            <Loader2 size={32} className="animate-spin text-[#f5c200]" />
            <p>Cargando reservaciones...</p>
          </div>
        )}

        {/* ACTIVAS */}
        {!loading && activas.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 border-b border-[rgba(245,194,0,.1)] pb-2 font-serif text-2xl font-semibold text-[#f0ead6]">
              Reservaciones activas
            </h2>
            <div className="flex flex-col gap-4">
              {activas.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-[rgba(245,194,0,.12)] bg-[rgba(10,28,16,.8)] p-6"
                >
                  {/* CARD HEADER */}
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="mb-1 font-serif text-xl font-semibold text-[#f0ead6]">
                        {r.parque_nombre || 'Parque'}
                      </h3>
                      <p className="flex items-center gap-1.5 text-sm text-[rgba(180,200,185,.55)]">
                        <Home size={13} />
                        {r.tipo_visita || 'Cabaña'} ·{' '}
                        {diffDays(r.fecha_inicio, r.fecha_fin)} noches
                      </p>
                    </div>
                    <span
                      className={`whitespace-nowrap rounded-full px-4 py-1 text-xs font-semibold ${
                        STATUS_CLASS[r.estatus || r.estado || 'activa']
                      }`}
                    >
                      {STATUS_LABEL[r.estatus || r.estado || 'activa']}
                    </span>
                  </div>

                  {/* CARD INFO */}
                  <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {[
                      ['Entrada', fmtDate(r.fecha_inicio)],
                      ['Salida', fmtDate(r.fecha_fin)],
                      ['Personas', r.numero_personas, 'personas'],
                      ['Reservación #', r.id],
                    ].map(([label, value, type]) => (
                      <div
                        key={label}
                        className="flex flex-col gap-1 rounded-xl border border-[rgba(245,194,0,.08)] bg-[rgba(245,194,0,.04)] px-4 py-3"
                      >
                        <span className="text-[11px] uppercase tracking-wider text-[rgba(180,200,185,.4)]">
                          {label}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm font-medium text-[#e8dfc8]">
                          {type === 'personas' && <Users size={13} />}
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CARD FOOTER */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(245,194,0,.08)] pt-4">
                    <p className="flex items-center gap-1.5 text-sm text-[rgba(180,200,185,.4)]">
                      <Mail size={13} />
                      Confirmación enviada a tu correo
                    </p>
                    <button
                      onClick={() => setCancelTarget(r)}
                      className="rounded-lg border border-[rgba(240,80,80,.25)] px-4 py-2 text-sm text-[#f07070] transition hover:border-[rgba(240,80,80,.4)] hover:bg-[rgba(240,80,80,.1)]"
                    >
                      Cancelar reservación
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* HISTORIAL */}
        {!loading && historial.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 border-b border-[rgba(245,194,0,.1)] pb-2 font-serif text-2xl font-semibold text-[#f0ead6]">
              Historial
            </h2>
            <div className="flex flex-col gap-4 opacity-70">
              {historial.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-[rgba(245,194,0,.08)] bg-[rgba(10,20,12,.5)] p-6"
                >
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="mb-1 font-serif text-xl font-semibold text-[#f0ead6]">
                        {r.parque_nombre || 'Parque'}
                      </h3>
                      <p className="flex items-center gap-1.5 text-sm text-[rgba(180,200,185,.55)]">
                        <Home size={13} />
                        {r.tipo_visita || 'Cabaña'} ·{' '}
                        {diffDays(r.fecha_inicio, r.fecha_fin)} noches
                      </p>
                    </div>
                    <span
                      className={`whitespace-nowrap rounded-full px-4 py-1 text-xs font-semibold ${
                        STATUS_CLASS[r.estatus || r.estado || 'completada']
                      }`}
                    >
                      {STATUS_LABEL[r.estatus || r.estado || 'completada']}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {[
                      ['Entrada', fmtDate(r.fecha_inicio)],
                      ['Salida', fmtDate(r.fecha_fin)],
                      ['Personas', r.numero_personas, 'personas'],
                      ['Reservación #', r.id],
                    ].map(([label, value, type]) => (
                      <div
                        key={label}
                        className="flex flex-col gap-1 rounded-xl border border-[rgba(245,194,0,.08)] bg-[rgba(245,194,0,.04)] px-4 py-3"
                      >
                        <span className="text-[11px] uppercase tracking-wider text-[rgba(180,200,185,.4)]">
                          {label}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm font-medium text-[#e8dfc8]">
                          {type === 'personas' && <Users size={13} />}
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EMPTY */}
        {!loading && activas.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[rgba(245,194,0,.1)] bg-[rgba(245,194,0,.03)] p-12 text-center">
            <Leaf
              size={48}
              className="mx-auto mb-3 text-[rgba(180,200,185,.3)]"
            />
            <p className="mb-5 text-sm text-[rgba(180,200,185,.5)]">
              No tienes reservaciones activas.
            </p>
            <Link
              to="/parques"
              className="inline-flex items-center gap-2 rounded-xl bg-[#f5c200] px-6 py-3 text-sm font-semibold text-[#050e08] transition hover:bg-[#ffd028]"
            >
              Explorar parques
            </Link>
          </div>
        )}

      </main>

      {/* MODAL */}
      {cancelTarget && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[420px] rounded-[20px] border border-[rgba(245,194,0,.2)] bg-[#0a1c10] p-8 text-center shadow-[0_40px_80px_rgba(0,0,0,.7)]">
            <AlertTriangle
              size={48}
              className="mx-auto mb-3 text-[#f5c200]"
            />
            <h3 className="mb-3 font-serif text-3xl text-[#f0ead6]">
              Cancelar reservación
            </h3>
            <p className="mb-2 text-sm leading-7 text-[rgba(180,200,185,.65)]">
              ¿Seguro que deseas cancelar esta reservación?
            </p>
            <p className="mb-6 text-xs text-[rgba(240,80,80,.6)]">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                className="rounded-xl border border-[rgba(245,194,0,.2)] px-6 py-3 text-sm text-[rgba(200,190,150,.7)] transition hover:border-[rgba(245,194,0,.4)] hover:text-[#e8dfc8]"
              >
                No, mantener
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex items-center gap-2 rounded-xl border border-[rgba(220,60,60,.35)] bg-[rgba(220,60,60,.15)] px-6 py-3 text-sm text-[#f07070] transition hover:bg-[rgba(220,60,60,.25)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelling && (
                  <Loader2
                    size={16}
                    className="animate-spin text-[#f07070]"
                  />
                )}
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
