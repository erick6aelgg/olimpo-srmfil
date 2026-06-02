// Hooks de React
import { useState, useEffect, useRef } from 'react'

// Navegación entre rutas
import { Link, useNavigate } from 'react-router-dom'

// Contexto de autenticación
import { useAuth } from '../context/AuthContext'

// Cliente Axios configurado
import api from '../services/api'

// Iconos FontAwesome
import {
  FaTree,
  FaClipboardList,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSignOutAlt,
  FaHome,
  FaUsers,
  FaCampground,
  FaExclamationTriangle,
  FaTimes,
} from 'react-icons/fa'

import { Pencil, Plus } from "lucide-react";

// Icono de administrador
import {
  MdAdminPanelSettings
} from 'react-icons/md'

const fmtDate = (d) =>
  d ? new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const diffDays = (a, b) =>
  a && b ? Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86400000)) : '—'

const fmt = (t) => {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hr = parseInt(h)
  return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`
}

const emptyParque = {
  nombre: '', direccion: '', latitud: '', longitud: '',
  hora_apertura: '', hora_cierre: '', tiene_cabanas: false,
  capacidad_maxima: '', estatus_parque: 'activo',
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('parques')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const [parques, setParques] = useState([])
  const [parquesLoading, setParquesLoading] = useState(true)
  const [parqueForm, setParqueForm] = useState(emptyParque)
  const [editingId, setEditingId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSaving, setFormSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [reservaciones, setReservaciones] = useState([])
  const [resLoading, setResLoading] = useState(false)
  const [resFiltro, setResFiltro] = useState('todas')

  const [toast, setToast] = useState(null)
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const fetchParques = () => {
    setParquesLoading(true)
    api.get('/api/parks/')
      .then(({ data }) => setParques(Array.isArray(data) ? data : data.results || []))
      .catch(() => setParques([]))
      .finally(() => setParquesLoading(false))
  }

  const fetchReservaciones = async () => {
    setResLoading(true)
    try {
      const { data } = await api.get('/api/parks/')
      const parquesData = Array.isArray(data) ? data : data.results || []
      const all = await Promise.all(
        parquesData.map(p =>
          api.get(`/api/reservations/park/${p.id}/`)
            .then(r => Array.isArray(r.data) ? r.data : r.data.results || [])
            .catch(() => [])
        )
      )
      const flat = all.flat()
      const unique = flat.filter((r, i, arr) => arr.findIndex(x => x.id === r.id) === i)
      setReservaciones(unique.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)))
    } catch { setReservaciones([]) }
    finally { setResLoading(false) }
  }

  useEffect(() => { fetchParques() }, [])
  useEffect(() => { if (tab === 'reservaciones') fetchReservaciones() }, [tab])

  const openCreate = () => { setParqueForm(emptyParque); setEditingId(null); setFormError(''); setFormOpen(true) }
  const openEdit = (p) => {
    setParqueForm({
      nombre: p.nombre, direccion: p.direccion, latitud: p.latitud, longitud: p.longitud,
      hora_apertura: p.hora_apertura, hora_cierre: p.hora_cierre,
      tiene_cabanas: p.tiene_cabanas, capacidad_maxima: p.capacidad_maxima,
      estatus_parque: p.estatus_parque,
    })
    setEditingId(p.id); setFormError(''); setFormOpen(true)
  }

  const handleParqueChange = (e) => {
    const { name, value, type, checked } = e.target
    setParqueForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    setFormError('')
  }

  const handleParqueSave = async (e) => {
    e.preventDefault()
    if (!parqueForm.nombre || !parqueForm.latitud || !parqueForm.longitud) {
      setFormError('Nombre y coordenadas son requeridos.')
      return
    }
    setFormSaving(true)
    try {
      const payload = { ...parqueForm, capacidad_maxima: parseInt(parqueForm.capacidad_maxima) || 0 }
      if (editingId) {
        await api.patch(`/api/parks/${editingId}/update/`, payload)
        showToast('Parque actualizado correctamente.')
      } else {
        await api.post('/api/parks/create/', payload)
        showToast('Parque creado correctamente.')
      }
      setFormOpen(false)
      fetchParques()
    } catch (err) {
      const d = err.response?.data
      if (d) { const f = Object.values(d)[0]; setFormError(Array.isArray(f) ? f[0] : String(f)) }
      else setFormError('Error al guardar.')
    } finally { setFormSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/api/parks/${deleteTarget.id}/delete/`)
      showToast('Parque eliminado.')
      setDeleteTarget(null)
      fetchParques()
    } catch { showToast('No se pudo eliminar.', 'error') }
    finally { setDeleting(false) }
  }

  const toggleEstatus = async (p) => {
    const nuevo = p.estatus_parque === 'activo' ? 'inactivo' : 'activo'
    try {
      await api.patch(`/api/parks/${p.id}/update/`, { estatus_parque: nuevo })
      showToast(`Parque ${nuevo === 'activo' ? 'activado' : 'desactivado'}.`)
      fetchParques()
    } catch { showToast('Error al cambiar estatus.', 'error') }
  }

  const initials = user
    ? `${user.first_name?.[0] || ''}${(user.apellido_p || user.last_name)?.[0] || ''}`.toUpperCase() || 'A'
    : 'A'

  const resFiltered = reservaciones.filter(r => {
    if (resFiltro === 'activas') return r.estado === 'activa'
    if (resFiltro === 'canceladas') return r.estado === 'cancelada'
    return true
  })

  const tabs = [
    {
      id: 'parques',
      label: 'Parques',
      icon: FaTree,
      count: parques.length
    },
    {
      id: 'reservaciones',
      label: 'Reservaciones',
      icon: FaClipboardList,
      count: reservaciones.length
    },
  ]

  return (
    <div className="min-h-screen bg-[#030c06] text-[#e8dfc8] font-sans">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-xl text-sm font-medium shadow-2xl border animate-pulse-once flex items-center gap-2
          ${toast.type === 'error'
            ? 'bg-red-950 border-red-500/30 text-red-300'
            : 'bg-green-950 border-green-500/30 text-green-300'}`}>
          {toast.type === 'error' ? <FaExclamationTriangle /> : '✓'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 h-[60px] bg-[#030c06]/95 border-b border-yellow-500/10 backdrop-blur-md flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-[#c8b882] text-sm font-medium">
            <FaTree className="text-yellow-400" />
            Luciérnagas <em className="not-italic text-yellow-400">2026</em>
          </Link>
          <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/25 text-yellow-400">
            <div className="flex items-center gap-1">
              <MdAdminPanelSettings size={12} />
              Admin
            </div>
          </span>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-full bg-yellow-400/10 border border-yellow-400/35 text-yellow-400 text-sm font-bold flex items-center justify-center hover:bg-yellow-400/20 transition"
          >
            {initials}
          </button>
          {menuOpen && (
            <div className="absolute top-12 right-0 w-56 bg-[#0d2418] border border-yellow-500/20 rounded-2xl p-2 shadow-2xl">
              <div className="px-3 py-2 border-b border-yellow-500/10 mb-1">
                <p className="text-sm font-medium text-[#e8dfc8]">{user?.first_name} {user?.apellido_p}</p>
                <p className="text-xs text-[#b4c8b9]/50 mt-0.5">{user?.email}</p>
                <span className="text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-semibold tracking-wider uppercase">
                  Administrador
                </span>
              </div>
              <button
                onClick={() => { logout(); navigate('/login') }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition"
              >
                <div className="flex items-center gap-2">
                  <FaSignOutAlt />
                  Cerrar sesión
                </div>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-60px)]">

        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 bg-[#040e07] border-r border-yellow-500/8 flex flex-col py-6 gap-1">
          <p className="text-[10px] font-bold tracking-widest uppercase text-[#b4c8b9]/35 px-4 mb-2">Panel</p>

          {tabs.map(t => {
            const Icon = t.icon

            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 mx-2 rounded-xl text-sm transition text-left
                    ${tab === t.id
                    ? 'bg-yellow-400/10 text-yellow-400 font-medium'
                    : 'text-[#c8b882]/60 hover:bg-yellow-400/5 hover:text-[#e8dfc8]'}`}
              >
                <Icon size={15} />
                {t.label}

                <span className="ml-auto text-[10px] bg-yellow-400/10 text-yellow-400/75 px-1.5 py-0.5 rounded-full font-semibold">
                  {t.count}
                </span>
              </button>
            )
          })}

          <div className="mt-4 px-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#b4c8b9]/35 mb-2">Acciones</p>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 w-full rounded-xl text-sm text-[#c8b882]/60 hover:bg-yellow-400/5 hover:text-[#e8dfc8] transition"
            >
              <FaPlus />
              Nuevo parque
            </button>
          </div>

          {/* Mini stats */}
          <div className="mt-auto mx-4 p-3 rounded-xl bg-yellow-400/5 border border-yellow-500/10">
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-xl font-bold text-yellow-400">{parques.filter(p => p.estatus_parque === 'activo').length}</p>
                <p className="text-[10px] text-[#b4c8b9]/40 mt-0.5">Activos</p>
              </div>
              <div className="w-px bg-yellow-500/10" />
              <div className="text-center">
                <p className="text-xl font-bold text-green-400">{reservaciones.filter(r => r.estado === 'activa').length}</p>
                <p className="text-[10px] text-[#b4c8b9]/40 mt-0.5">Reservas</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-8">

          {/* ══ PARQUES ══ */}
          {tab === 'parques' && (
            <div>
              <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
                <div>
                  <h1 className="flex items-center gap-2 text-2xl font-bold text-[#f0ead6]">
                    <FaTree className="text-emerald-500" /> Gestión de parques
                  </h1>
                  <p className="text-sm text-[#b4c8b9]/45 mt-1">Crea, edita o elimina los parques del festival</p>
                </div>
                <button
                  onClick={openCreate}
                  className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-[#050e08] text-sm font-bold rounded-xl hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20"
                >
                  <FaPlus /> Nuevo parque
                </button>
              </div>

              {parquesLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#b4c8b9]/40">
                  <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
                  <p>Cargando parques…</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-yellow-500/10 overflow-hidden overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-yellow-400/5 border-b border-yellow-500/10">
                        {['Parque', 'Dirección', 'Horario', 'Cap.', 'Hospedaje', 'Estatus', 'Acciones'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#b4c8b9]/40 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parques.map(p => (
                        <tr
                          key={p.id}
                          className={`border-b border-yellow-500/5 hover:bg-yellow-400/3 transition ${p.estatus_parque === 'inactivo' ? 'opacity-50' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#0d2418] flex-shrink-0 flex items-center justify-center text-yellow-400/30 text-lg">
                                {p.imagenes?.find(i => i.es_principal)
                                  ? <img src={p.imagenes.find(i => i.es_principal).url} alt="" className="w-full h-full object-cover" />
                                  : <FaTree size={16} />}
                              </div>
                              <span className="font-medium text-[#f0ead6] text-sm">{p.nombre}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#b4c8b9]/50 text-xs max-w-[160px] truncate">{p.direccion}</td>
                          <td className="px-4 py-3 text-[#b4c8b9]/50 text-xs whitespace-nowrap">{fmt(p.hora_apertura)} – {fmt(p.hora_cierre)}</td>
                          <td className="px-4 py-3 text-center text-[#e8dfc8]">{p.capacidad_maxima}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 flex-wrap">
                              {p.tiene_cabanas && (
                                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400">
                                  <FaHome size={10} /> Cabañas
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                                <FaCampground size={10} /> Camping
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleEstatus(p)}
                                className={`relative w-10 h-6 rounded-full transition-colors duration-300 ${p.estatus_parque === 'activo' ? 'bg-yellow-400' : 'bg-white/10'}`}
                              >
                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${p.estatus_parque === 'activo' ? 'left-[18px]' : 'left-0.5'}`} />
                              </button>
                              <span className="text-xs text-[#b4c8b9]/45">{p.estatus_parque === 'activo' ? 'Activo' : 'Inactivo'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/22 transition flex items-center justify-center text-[#c8b882]" title="Editar">
                                <FaEdit size={14} />
                              </button>
                              <button onClick={() => setDeleteTarget(p)} className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/22 transition flex items-center justify-center text-red-400" title="Eliminar">
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parques.length === 0 && (
                    <div className="flex flex-col items-center gap-3 py-16 text-[#b4c8b9]/40">
                      <p>No hay parques registrados.</p>
                      <button onClick={openCreate} className="px-4 py-2 bg-yellow-400 text-[#050e08] text-sm font-bold rounded-xl hover:bg-yellow-300 transition">
                        Crear primer parque
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══ RESERVACIONES ══ */}
          {tab === 'reservaciones' && (
            <div>
              <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <h1 className="flex items-center gap-2 text-2xl font-bold text-[#f0ead6]">
                    <FaClipboardList className="text-yellow-400" /> Todas las reservaciones
                  </h1>
                  <p className="text-sm text-[#b4c8b9]/45 mt-1">{reservaciones.length} reservaciones totales en el sistema</p>
                </div>
                <div className="flex gap-3">
                  <div className="text-center px-4 py-2 rounded-xl bg-green-500/8 border border-green-500/15">
                    <p className="text-xl font-bold text-green-400">{reservaciones.filter(r => r.estado === 'activa').length}</p>
                    <p className="text-[10px] text-[#b4c8b9]/40">Activas</p>
                  </div>
                  <div className="text-center px-4 py-2 rounded-xl bg-yellow-400/5 border border-yellow-500/10">
                    <p className="text-xl font-bold text-[#f5c200]">{reservaciones.filter(r => r.estado === 'cancelada').length}</p>
                    <p className="text-[10px] text-[#b4c8b9]/40">Canceladas</p>
                  </div>
                </div>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2 mb-6">
                {['todas', 'activas', 'canceladas'].map(t => (
                  <button
                    key={t}
                    onClick={() => setResFiltro(t)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition
                      ${resFiltro === t
                        ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400 font-medium'
                        : 'border-yellow-500/10 text-[#c8b882]/55 hover:border-yellow-500/20 hover:text-[#e8dfc8]'}`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                    <span className="text-[10px] bg-yellow-400/10 text-yellow-400/70 px-1.5 py-0.5 rounded-full font-bold">
                      {t === 'todas' ? reservaciones.length : t === 'activas'
                        ? reservaciones.filter(r => r.estado === 'activa').length
                        : reservaciones.filter(r => r.estado === 'cancelada').length}
                    </span>
                  </button>
                ))}
              </div>

              {resLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#b4c8b9]/40">
                  <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
                  <p>Cargando reservaciones…</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-yellow-500/10 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-yellow-400/5 border-b border-yellow-500/10">
                        {['Folio', 'Usuario', 'Correo', 'Parque', 'Tipo', 'Fecha inicio', 'Duración', 'Personas', 'Estado'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#b4c8b9]/40 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resFiltered.map(r => (
                        <tr key={r.id} className={`border-b border-yellow-500/5 hover:bg-yellow-400/3 transition ${r.estado === 'cancelada' ? 'opacity-50' : ''}`}>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-yellow-400/70 bg-yellow-400/7 px-2 py-0.5 rounded-md">
                              #{String(r.id).padStart(5, '0')}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-[#e8dfc8] text-xs">{r.usuario_email?.split('@')[0] || `#${r.usuario}`}</td>
                          <td className="px-4 py-3 text-[#b4c8b9]/50 text-xs max-w-[160px] truncate">{r.usuario_email || '—'}</td>
                          <td className="px-4 py-3 font-medium text-[#e8dfc8] text-xs">{r.parque_nombre || `Parque #${r.parque}`}</td>
                          <td className="px-4 py-3">
                            <span className={`flex items-center gap-1 w-fit text-[10px] px-2 py-0.5 rounded-full border font-medium
                              ${r.tipo_visita === 'cabana'
                                ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400'
                                : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                              {r.tipo_visita === 'cabana' ? <><FaHome size={10} /> Cabaña</> : <><FaCampground size={10} /> Camping</>}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#b4c8b9]/50 text-xs whitespace-nowrap">{fmtDate(r.fecha_inicio)}</td>
                          <td className="px-4 py-3 text-center text-[#e8dfc8] text-xs">{diffDays(r.fecha_inicio, r.fecha_fin)} noches</td>
                          <td className="px-4 py-3 text-center text-[#e8dfc8]">
                            <div className="flex items-center justify-center gap-1.5">
                              <FaUsers className="text-yellow-400/80" size={16} />
                              <span>{r.numero_personas}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold
                              ${r.estado === 'activa'
                                ? 'bg-green-500/14 border-green-500/22 text-green-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                              {r.estado === 'activa' ? '✓ Activa' : '✕ Cancelada'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {resFiltered.length === 0 && (
                    <div className="flex flex-col items-center py-16 gap-2 text-[#b4c8b9]/40">
                      <p className="text-sm">{reservaciones.length === 0 ? 'No hay reservaciones.' : 'Sin resultados en este filtro.'}</p>
                      {reservaciones.length > 0 && (
                        <button onClick={() => setResFiltro('todas')} className="text-xs text-yellow-400 underline">Ver todas</button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ══ PARK FORM MODAL ══ */}
      {formOpen && (
        <div
          className="fixed inset-0 z-[500] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && !formSaving && setFormOpen(false)}
        >
          <div className="bg-[#0a1c10] border border-yellow-500/18 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-yellow-500/10">
              <h2 className="text-lg font-bold text-[#f0ead6] flex items-center gap-2">
                {editingId ? (
                  <>
                    <Pencil size={20} />
                    <span>Editar parque</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    <span>Nuevo parque</span>
                  </>
                )}
              </h2>
              <button onClick={() => setFormOpen(false)} disabled={formSaving}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-[#e8dfc8] flex items-center justify-center hover:bg-red-500/20 transition text-sm">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleParqueSave} className="p-6">
              <div className="grid grid-cols-2 gap-4">

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b4c8b9]/55 mb-1.5">Nombre del parque *</label>
                  <input name="nombre" value={parqueForm.nombre} onChange={handleParqueChange}
                    placeholder="Bosque de las Luciérnagas"
                    className="w-full bg-white/4 border border-yellow-400/14 rounded-xl px-4 py-2.5 text-[#eee8d5] text-sm outline-none focus:border-yellow-400/55 focus:ring-1 focus:ring-yellow-400/10 transition" required />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b4c8b9]/55 mb-1.5">Dirección</label>
                  <input name="direccion" value={parqueForm.direccion} onChange={handleParqueChange}
                    placeholder="Km 45, Carretera Nacional, Tlaxcala"
                    className="w-full bg-white/4 border border-yellow-400/14 rounded-xl px-4 py-2.5 text-[#eee8d5] text-sm outline-none focus:border-yellow-400/55 focus:ring-1 focus:ring-yellow-400/10 transition" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b4c8b9]/55 mb-1.5">Latitud *</label>
                  <input name="latitud" type="number" step="any" value={parqueForm.latitud} onChange={handleParqueChange}
                    placeholder="19.3721"
                    className="w-full bg-white/4 border border-yellow-400/14 rounded-xl px-4 py-2.5 text-[#eee8d5] text-sm outline-none focus:border-yellow-400/55 focus:ring-1 focus:ring-yellow-400/10 transition" required />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b4c8b9]/55 mb-1.5">Longitud *</label>
                  <input name="longitud" type="number" step="any" value={parqueForm.longitud} onChange={handleParqueChange}
                    placeholder="-99.1532"
                    className="w-full bg-white/4 border border-yellow-400/14 rounded-xl px-4 py-2.5 text-[#eee8d5] text-sm outline-none focus:border-yellow-400/55 focus:ring-1 focus:ring-yellow-400/10 transition" required />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b4c8b9]/55 mb-1.5">Hora apertura</label>
                  <input name="hora_apertura" type="time" value={parqueForm.hora_apertura} onChange={handleParqueChange}
                    className="w-full bg-white/4 border border-yellow-400/14 rounded-xl px-4 py-2.5 text-[#eee8d5] text-sm outline-none focus:border-yellow-400/55 transition" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b4c8b9]/55 mb-1.5">Hora cierre</label>
                  <input name="hora_cierre" type="time" value={parqueForm.hora_cierre} onChange={handleParqueChange}
                    className="w-full bg-white/4 border border-yellow-400/14 rounded-xl px-4 py-2.5 text-[#eee8d5] text-sm outline-none focus:border-yellow-400/55 transition" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b4c8b9]/55 mb-1.5">Capacidad máxima</label>
                  <input name="capacidad_maxima" type="number" min="1" value={parqueForm.capacidad_maxima} onChange={handleParqueChange}
                    placeholder="100"
                    className="w-full bg-white/4 border border-yellow-400/14 rounded-xl px-4 py-2.5 text-[#eee8d5] text-sm outline-none focus:border-yellow-400/55 transition" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b4c8b9]/55 mb-1.5">Estatus</label>
                  <select name="estatus_parque" value={parqueForm.estatus_parque} onChange={handleParqueChange}
                    className="w-full bg-[#0d2418] border border-yellow-400/14 rounded-xl px-4 py-2.5 text-[#eee8d5] text-sm outline-none focus:border-yellow-400/55 transition">
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div className={`relative w-10 h-6 rounded-full transition-colors ${parqueForm.tiene_cabanas ? 'bg-yellow-400' : 'bg-white/10'}`}
                      onClick={() => setParqueForm(f => ({ ...f, tiene_cabanas: !f.tiene_cabanas }))}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${parqueForm.tiene_cabanas ? 'left-[18px]' : 'left-0.5'}`} />
                    </div>
                    <span className="text-sm text-[#e8dfc8]">Este parque tiene cabañas disponibles</span>
                  </label>
                </div>
              </div>

              {formError && (
                <p className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/22 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <FaExclamationTriangle /> {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-yellow-500/10">
                <button type="button" onClick={() => setFormOpen(false)} disabled={formSaving}
                  className="px-5 py-2.5 border border-yellow-400/20 text-[#c8b882]/70 rounded-xl text-sm hover:border-yellow-400/40 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={formSaving}
                  className="px-6 py-2.5 bg-yellow-400 text-[#050e08] font-bold text-sm rounded-xl hover:bg-yellow-300 transition flex items-center gap-2 disabled:opacity-60">
                  {formSaving
                    ? <><span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Guardando…</>
                    : editingId ? 'Guardar cambios' : 'Crear parque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRMATION MODAL ══ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[500] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1c10] border border-red-500/20 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <FaExclamationTriangle size={24} />
              <h3 className="text-lg font-bold text-[#f0ead6]">¿Eliminar parque?</h3>
            </div>
            <p className="text-sm text-[#b4c8b9]/70 mb-6">
              Estás a punto de eliminar permanentemente el parque <strong className="text-[#e8dfc8]">{deleteTarget.nombre}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 border border-yellow-400/20 text-[#c8b882]/70 rounded-xl text-sm hover:border-yellow-400/40 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-500 transition flex items-center gap-2 disabled:opacity-60"
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}