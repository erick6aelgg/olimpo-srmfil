import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
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
import { Pencil, Plus, Wrench, ToggleLeft, ToggleRight, Tags, CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react'
import { MdAdminPanelSettings } from 'react-icons/md'

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

const emptyServicio = {
  nombre: '',
  descripcion: '',
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('parques')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Parques
  const [parques, setParques] = useState([])
  const [parquesLoading, setParquesLoading] = useState(true)
  const [parqueForm, setParqueForm] = useState(emptyParque)
  const [editingId, setEditingId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSaving, setFormSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Reservaciones
  const [reservaciones, setReservaciones] = useState([])
  const [resLoading, setResLoading] = useState(false)
  const [resFiltro, setResFiltro] = useState('todas')

  // Servicios
  const [servicios, setServicios] = useState([])
  const [serviciosLoading, setServiciosLoading] = useState(false)
  const [servicioForm, setServicioForm] = useState(emptyServicio)
  const [editingServicioId, setEditingServicioId] = useState(null)
  const [servicioFormOpen, setServicioFormOpen] = useState(false)
  const [servicioFormError, setServicioFormError] = useState('')
  const [servicioFormSaving, setServicioFormSaving] = useState(false)
  const [deleteServicioTarget, setDeleteServicioTarget] = useState(null)
  const [deletingServicio, setDeletingServicio] = useState(false)
  // Panel de asignacion de servicios a parques
  const [asignacionOpen, setAsignacionOpen] = useState(null) // parque id expandido
  const [asignacionSaving, setAsignacionSaving] = useState(false)

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

  const fetchServicios = () => {
    setServiciosLoading(true)
    api.get('/api/services/')
      .then(({ data }) => setServicios(Array.isArray(data) ? data : data.results || []))
      .catch(() => setServicios([]))
      .finally(() => setServiciosLoading(false))
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
  useEffect(() => { if (tab === 'servicios') { fetchServicios(); fetchParques() } }, [tab])

  // ── Parques CRUD ──
  const openCreate = () => {
    setParqueForm(emptyParque)
    setEditingId(null)
    setFormError('')
    setFormOpen(true)
    setImageFile(null)
    setImagePreview(null)
  }

  const openEdit = (p) => {
    setParqueForm({
      nombre: p.nombre, direccion: p.direccion, latitud: p.latitud, longitud: p.longitud,
      hora_apertura: p.hora_apertura, hora_cierre: p.hora_cierre,
      tiene_cabanas: p.tiene_cabanas, capacidad_maxima: p.capacidad_maxima,
      estatus_parque: p.estatus_parque,
    })
    setEditingId(p.id)
    setFormError('')
    setFormOpen(true)
    setImageFile(null)
    const principal = p.imagenes?.find(i => i.es_principal)
    setImagePreview(principal ? principal.url : null)
  }

  const handleParqueChange = (e) => {
    const { name, value, type, checked } = e.target
    setParqueForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    setFormError('')
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
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
      let parqueId = editingId
      if (editingId) {
        await api.patch(`/api/parks/${editingId}/update/`, payload)
        showToast('Parque actualizado correctamente.')
      } else {
        const { data } = await api.post('/api/parks/create/', payload)
        parqueId = data.id
        showToast('Parque creado correctamente.')
      }
      if (imageFile && parqueId) {
        const formData = new FormData()
        formData.append('imagen', imageFile)
        formData.append('es_principal', 'true')
        try {
          await api.post(`/api/parks/${parqueId}/images/`, formData, {
            headers: { 'Content-Type': undefined },
          })
        } catch (err) {
          console.error('Error imagen:', err.response?.data)
          showToast('Parque guardado, pero la imagen no se subio.', 'error')
        }
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

  // ── Servicios CRUD ──
  const openCreateServicio = () => {
    setServicioForm(emptyServicio)
    setEditingServicioId(null)
    setServicioFormError('')
    setServicioFormOpen(true)
  }

  const openEditServicio = (s) => {
    setServicioForm({ nombre: s.nombre, descripcion: s.descripcion || '' })
    setEditingServicioId(s.id)
    setServicioFormError('')
    setServicioFormOpen(true)
  }

  const handleServicioChange = (e) => {
    const { name, value } = e.target
    setServicioForm(f => ({ ...f, [name]: value }))
    setServicioFormError('')
  }

  const handleServicioSave = async (e) => {
    e.preventDefault()
    if (!servicioForm.nombre.trim()) {
      setServicioFormError('El nombre del servicio es requerido.')
      return
    }
    setServicioFormSaving(true)
    try {
      if (editingServicioId) {
        await api.patch(`/api/services/${editingServicioId}/`, servicioForm)
        showToast('Servicio actualizado correctamente.')
      } else {
        await api.post('/api/services/', servicioForm)
        showToast('Servicio creado correctamente.')
      }
      setServicioFormOpen(false)
      fetchServicios()
    } catch (err) {
      const d = err.response?.data
      if (d) { const f = Object.values(d)[0]; setServicioFormError(Array.isArray(f) ? f[0] : String(f)) }
      else setServicioFormError('Error al guardar el servicio.')
    } finally { setServicioFormSaving(false) }
  }

  const handleDeleteServicio = async () => {
    setDeletingServicio(true)
    try {
      await api.delete(`/api/services/${deleteServicioTarget.id}/`)
      showToast('Servicio eliminado.')
      setDeleteServicioTarget(null)
      fetchServicios()
    } catch { showToast('No se pudo eliminar el servicio.', 'error') }
    finally { setDeletingServicio(false) }
  }

  // ── Asignacion de servicios a parques ──
  const toggleServicioEnParque = async (parque, servicioId) => {
    const ids = (parque.servicios || []).map(s => s.id)
    const yaAsignado = ids.includes(servicioId)
    const nuevosIds = yaAsignado
      ? ids.filter(id => id !== servicioId)
      : [...ids, servicioId]

    setAsignacionSaving(true)
    try {
      await api.patch(`/api/parks/${parque.id}/update/`, { servicios: nuevosIds })
      showToast(yaAsignado ? 'Servicio removido del parque.' : 'Servicio asignado al parque.')
      fetchParques()
    } catch { showToast('Error al actualizar servicios del parque.', 'error') }
    finally { setAsignacionSaving(false) }
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
    { id: 'parques', label: 'Parques', icon: FaTree, count: parques.length },
    { id: 'servicios', label: 'Servicios', icon: Wrench, count: servicios.length },
    { id: 'reservaciones', label: 'Reservaciones', icon: FaClipboardList, count: reservaciones.length },
  ]

  return (
    <div className="min-h-screen bg-[#030c06] text-[#e8dfc8] font-sans">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-xl text-sm font-medium shadow-2xl border animate-pulse-once flex items-center gap-2
          ${toast.type === 'error'
            ? 'bg-red-950 border-red-500/30 text-red-300'
            : 'bg-green-950 border-green-500/30 text-green-300'}`}>
          {toast.type === 'error' ? <FaExclamationTriangle /> : <CheckCircle2 size={15} />} {toast.msg}
        </div>
      )}

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
                className={`flex items-center gap-2 px-4 py-2.5 mx-2 rounded-xl text-sm transition text-left cursor-pointer
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
              className="flex items-center cursor-pointer gap-2 px-4 py-2.5 w-full rounded-xl text-sm text-[#c8b882]/60 hover:bg-yellow-400/5 hover:text-[#e8dfc8] transition"
            >
              <FaPlus className='cursor-pointer' />
              Nuevo parque
            </button>
            <button
              onClick={() => { setTab('servicios'); setTimeout(openCreateServicio, 50) }}
              className="flex items-center cursor-pointer gap-2 px-4 py-2.5 w-full rounded-xl text-sm text-[#c8b882]/60 hover:bg-yellow-400/5 hover:text-[#e8dfc8] transition"
            >
              <Plus size={14} className='cursor-pointer' />
              Nuevo servicio
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
                    <FaTree className="text-emerald-500" /> Gestion de parques
                  </h1>
                  <p className="text-sm text-[#b4c8b9]/45 mt-1">Crea, edita o elimina los parques del festival</p>
                </div>
                <button
                  onClick={openCreate}
                  className="flex items-center cursor-pointer gap-2 px-5 py-2.5 bg-yellow-400 text-[#050e08] text-sm font-bold rounded-xl hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20"
                >
                  <FaPlus /> Nuevo parque
                </button>
              </div>

              {parquesLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#b4c8b9]/40">
                  <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
                  <p>Cargando parques...</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-yellow-500/10 overflow-hidden overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-yellow-400/5 border-b border-yellow-500/10">
                        {['Parque', 'Direccion', 'Horario', 'Cap.', 'Hospedaje', 'Estatus', 'Acciones'].map(h => (
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
                          <td className="px-4 py-3 text-[#b4c8b9]/50 text-xs whitespace-nowrap">{fmt(p.hora_apertura)} - {fmt(p.hora_cierre)}</td>
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
                              <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg cursor-pointer bg-yellow-400/10 hover:bg-yellow-400/22 transition flex items-center justify-center text-[#c8b882]" title="Editar">
                                <FaEdit size={14} />
                              </button>
                              <button onClick={() => setDeleteTarget(p)} className="w-8 h-8 cursor-pointer rounded-lg bg-red-500/10 hover:bg-red-500/22 transition flex items-center justify-center text-red-400" title="Eliminar">
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

          {/* ══ SERVICIOS ══ */}
          {tab === 'servicios' && (
            <div>
              <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
                <div>
                  <h1 className="flex items-center gap-2 text-2xl font-bold text-[#f0ead6]">
                    <Wrench size={22} className="text-yellow-400" /> Gestion de servicios
                  </h1>
                  <p className="text-sm text-[#b4c8b9]/45 mt-1">Crea, edita o elimina servicios y asignalos a los parques</p>
                </div>
                <button
                  onClick={openCreateServicio}
                  className="flex items-center cursor-pointer gap-2 px-5 py-2.5 bg-yellow-400 text-[#050e08] text-sm font-bold rounded-xl hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20"
                >
                  <FaPlus /> Nuevo servicio
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* ── Lista de servicios ── */}
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#b4c8b9]/45 mb-4">
                    <Tags size={14} /> Servicios disponibles
                  </h2>
                  {serviciosLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#b4c8b9]/40">
                      <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
                      <p>Cargando servicios...</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-yellow-500/10 overflow-hidden">
                      {servicios.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-16 text-[#b4c8b9]/40">
                          <Wrench size={28} className="opacity-30" />
                          <p className="text-sm">No hay servicios registrados.</p>
                          <button onClick={openCreateServicio} className="px-4 py-2 bg-yellow-400 text-[#050e08] text-sm font-bold rounded-xl hover:bg-yellow-300 transition">
                            Crear primer servicio
                          </button>
                        </div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-yellow-400/5 border-b border-yellow-500/10">
                              {['Nombre', 'Descripcion', 'Parques', 'Acciones'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#b4c8b9]/40 whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {servicios.map(s => {
                              const parquesConServicio = parques.filter(p =>
                                (p.servicios || []).some(ps => ps.id === s.id)
                              )
                              return (
                                <tr key={s.id} className="border-b border-yellow-500/5 hover:bg-yellow-400/3 transition">
                                  <td className="px-4 py-3">
                                    <span className="font-medium text-[#f0ead6]">{s.nombre}</span>
                                  </td>
                                  <td className="px-4 py-3 text-[#b4c8b9]/50 text-xs max-w-[180px] truncate">
                                    {s.descripcion || <span className="italic opacity-40">Sin descripcion</span>}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="text-[10px] bg-yellow-400/10 text-yellow-400/80 px-2 py-0.5 rounded-full font-semibold">
                                      {parquesConServicio.length} parque{parquesConServicio.length !== 1 ? 's' : ''}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex gap-1.5">
                                      <button
                                        onClick={() => openEditServicio(s)}
                                        className="w-8 h-8 rounded-lg cursor-pointer bg-yellow-400/10 hover:bg-yellow-400/22 transition flex items-center justify-center text-[#c8b882]"
                                        title="Editar"
                                      >
                                        <FaEdit size={14} />
                                      </button>
                                      <button
                                        onClick={() => setDeleteServicioTarget(s)}
                                        className="w-8 h-8 cursor-pointer rounded-lg bg-red-500/10 hover:bg-red-500/22 transition flex items-center justify-center text-red-400"
                                        title="Eliminar"
                                      >
                                        <FaTrash size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Asignacion de servicios por parque ── */}
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#b4c8b9]/45 mb-4">
                    <FaTree size={13} /> Servicios por parque
                  </h2>
                  {parquesLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#b4c8b9]/40">
                      <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
                      <p>Cargando parques...</p>
                    </div>
                  ) : parques.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-[#b4c8b9]/40 rounded-2xl border border-yellow-500/10">
                      <p className="text-sm">No hay parques registrados.</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-yellow-500/10 overflow-hidden divide-y divide-yellow-500/8">
                      {parques.map(p => {
                        const isOpen = asignacionOpen === p.id
                        const serviciosAsignados = (p.servicios || []).map(s => s.id)
                        return (
                          <div key={p.id}>
                            {/* Cabecera del parque */}
                            <button
                              onClick={() => setAsignacionOpen(isOpen ? null : p.id)}
                              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-yellow-400/4 transition text-left cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#0d2418] flex-shrink-0 flex items-center justify-center text-yellow-400/30">
                                {p.imagenes?.find(i => i.es_principal)
                                  ? <img src={p.imagenes.find(i => i.es_principal).url} alt="" className="w-full h-full object-cover" />
                                  : <FaTree size={14} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#f0ead6] truncate">{p.nombre}</p>
                                <p className="text-[10px] text-[#b4c8b9]/40 mt-0.5">
                                  {serviciosAsignados.length} servicio{serviciosAsignados.length !== 1 ? 's' : ''} asignado{serviciosAsignados.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {serviciosAsignados.length > 0 && (
                                  <div className="flex gap-1">
                                    {(p.servicios || []).slice(0, 3).map(s => (
                                      <span key={s.id} className="text-[9px] bg-yellow-400/10 border border-yellow-400/20 text-yellow-400/80 px-1.5 py-0.5 rounded-full truncate max-w-[60px]">
                                        {s.nombre}
                                      </span>
                                    ))}
                                    {serviciosAsignados.length > 3 && (
                                      <span className="text-[9px] bg-white/5 border border-white/10 text-[#b4c8b9]/40 px-1.5 py-0.5 rounded-full">
                                        +{serviciosAsignados.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {isOpen
                                  ? <ChevronUp size={14} className="text-[#b4c8b9]/40" />
                                  : <ChevronDown size={14} className="text-[#b4c8b9]/40" />}
                              </div>
                            </button>

                            {/* Panel de servicios expandible */}
                            {isOpen && (
                              <div className="px-4 pb-4 bg-yellow-400/2">
                                {servicios.length === 0 ? (
                                  <p className="text-xs text-[#b4c8b9]/40 py-3 text-center">
                                    No hay servicios registrados. Crea uno primero.
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-1 gap-2 pt-2">
                                    {servicios.map(s => {
                                      const asignado = serviciosAsignados.includes(s.id)
                                      return (
                                        <button
                                          key={s.id}
                                          onClick={() => !asignacionSaving && toggleServicioEnParque(p, s.id)}
                                          disabled={asignacionSaving}
                                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition cursor-pointer w-full
                                            ${asignado
                                              ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-300'
                                              : 'bg-white/3 border-white/8 text-[#b4c8b9]/60 hover:border-yellow-400/20 hover:bg-yellow-400/5 hover:text-[#e8dfc8]'}
                                            ${asignacionSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        >
                                          {asignado
                                            ? <CheckCircle2 size={15} className="text-yellow-400 flex-shrink-0" />
                                            : <Circle size={15} className="text-[#b4c8b9]/30 flex-shrink-0" />}
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-tight truncate">{s.nombre}</p>
                                            {s.descripcion && (
                                              <p className="text-[10px] text-[#b4c8b9]/35 mt-0.5 truncate">{s.descripcion}</p>
                                            )}
                                          </div>
                                          <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 font-medium
                                            ${asignado
                                              ? 'bg-yellow-400/15 border-yellow-400/25 text-yellow-400'
                                              : 'bg-white/5 border-white/10 text-[#b4c8b9]/30'}`}>
                                            {asignado ? 'Asignado' : 'Sin asignar'}
                                          </span>
                                        </button>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
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
                  <p>Cargando reservaciones...</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-yellow-500/10 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-yellow-400/5 border-b border-yellow-500/10">
                        {['Folio', 'Usuario', 'Correo', 'Parque', 'Tipo', 'Fecha inicio', 'Duracion', 'Personas', 'Estado'].map(h => (
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
                              {r.estado === 'activa' ? 'Activa' : 'Cancelada'}
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
                  <><Pencil size={20} /><span>Editar parque</span></>
                ) : (
                  <><Plus size={20} /><span>Nuevo parque</span></>
                )}
              </h2>
              <button onClick={() => setFormOpen(false)} disabled={formSaving}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-[#e8dfc8] flex items-center justify-center hover:bg-red-500/20 transition text-sm">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleParqueSave} className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b4c8b9]/55 mb-1.5">Nombre del parque *</label>
                  <input name="nombre" value={parqueForm.nombre} onChange={handleParqueChange}
                    placeholder="Bosque de las Luciernagas"
                    className="w-full bg-white/4 border border-yellow-400/14 rounded-xl px-4 py-2.5 text-[#eee8d5] text-sm outline-none focus:border-yellow-400/55 focus:ring-1 focus:ring-yellow-400/10 transition" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b4c8b9]/55 mb-1.5">Direccion</label>
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
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b4c8b9]/55 mb-1.5">Capacidad maxima</label>
                  <input name="capacidad_maxima" type="number" min="1" value={parqueForm.capacidad_maxima} onChange={handleParqueChange}
                    placeholder="100"
                    className="w-full bg-white/4 border border-yellow-400/14 rounded-xl px-4 py-2.5 text-[#eee8d5] text-sm outline-none focus:border-yellow-400/55 transition" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b4c8b9]/55 mb-1.5">Estatus</label>
                  <select name="estatus_parque" value={parqueForm.estatus_parque} onChange={handleParqueChange}
                    className="w-full bg-[#0d2418] border border-yellow-400/14 rounded-xl px-4 py-2.5 text-[#eee8d5] text-sm outline-none focus:border-yellow-400/55 transition cursor-pointer">
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
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b4c8b9]/55 mb-1.5">Imagen principal</label>
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-yellow-400/20 flex-shrink-0">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(null) }}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500/80 transition">
                          <FaTimes size={8} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl border border-dashed border-yellow-400/20 bg-white/3 flex items-center justify-center text-yellow-400/30 flex-shrink-0">
                        <FaTree size={22} />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="flex items-center gap-2 px-4 py-2.5 bg-white/4 border border-yellow-400/14 rounded-xl text-sm text-[#c8b882]/70 hover:border-yellow-400/40 hover:text-[#e8dfc8] cursor-pointer transition w-fit">
                        <FaPlus size={12} />
                        {imagePreview ? 'Cambiar imagen' : 'Elegir imagen'}
                        <input type="file" accept=".jpg,.jpeg,.png" onChange={handleImageChange} className="hidden" />
                      </label>
                      <p className="text-[10px] text-[#b4c8b9]/35 mt-2">JPG, JPEG o PNG. Se guardara como imagen principal del parque.</p>
                    </div>
                  </div>
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
                    ? <><span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Guardando...</>
                    : editingId ? 'Guardar cambios' : 'Crear parque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ SERVICIO FORM MODAL ══ */}
      {servicioFormOpen && (
        <div
          className="fixed inset-0 z-[500] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && !servicioFormSaving && setServicioFormOpen(false)}
        >
          <div className="bg-[#0a1c10] border border-yellow-500/18 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-yellow-500/10">
              <h2 className="text-lg font-bold text-[#f0ead6] flex items-center gap-2">
                {editingServicioId
                  ? <><Pencil size={18} /><span>Editar servicio</span></>
                  : <><Plus size={18} /><span>Nuevo servicio</span></>}
              </h2>
              <button onClick={() => setServicioFormOpen(false)} disabled={servicioFormSaving}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-[#e8dfc8] flex items-center justify-center hover:bg-red-500/20 transition text-sm">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleServicioSave} className="p-6">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b4c8b9]/55 mb-1.5">Nombre del servicio *</label>
                  <input
                    name="nombre"
                    value={servicioForm.nombre}
                    onChange={handleServicioChange}
                    placeholder="Wi-Fi, Estacionamiento, Sanitarios..."
                    className="w-full bg-white/4 border border-yellow-400/14 rounded-xl px-4 py-2.5 text-[#eee8d5] text-sm outline-none focus:border-yellow-400/55 focus:ring-1 focus:ring-yellow-400/10 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b4c8b9]/55 mb-1.5">Descripcion</label>
                  <textarea
                    name="descripcion"
                    value={servicioForm.descripcion}
                    onChange={handleServicioChange}
                    placeholder="Describe brevemente el servicio..."
                    rows={3}
                    className="w-full bg-white/4 border border-yellow-400/14 rounded-xl px-4 py-2.5 text-[#eee8d5] text-sm outline-none focus:border-yellow-400/55 focus:ring-1 focus:ring-yellow-400/10 transition resize-none"
                  />
                </div>
              </div>

              {servicioFormError && (
                <p className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/22 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <FaExclamationTriangle /> {servicioFormError}
                </p>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-yellow-500/10">
                <button type="button" onClick={() => setServicioFormOpen(false)} disabled={servicioFormSaving}
                  className="px-5 py-2.5 border border-yellow-400/20 text-[#c8b882]/70 rounded-xl text-sm hover:border-yellow-400/40 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={servicioFormSaving}
                  className="px-6 py-2.5 bg-yellow-400 text-[#050e08] font-bold text-sm rounded-xl hover:bg-yellow-300 transition flex items-center gap-2 disabled:opacity-60">
                  {servicioFormSaving
                    ? <><span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Guardando...</>
                    : editingServicioId ? 'Guardar cambios' : 'Crear servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ DELETE PARK MODAL ══ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[500] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1c10] border border-red-500/20 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <FaExclamationTriangle size={24} />
              <h3 className="text-lg font-bold text-[#f0ead6]">Eliminar parque</h3>
            </div>
            <p className="text-sm text-[#b4c8b9]/70 mb-6">
              Estas a punto de eliminar permanentemente el parque <strong className="text-[#e8dfc8]">{deleteTarget.nombre}</strong>. Esta accion no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="px-4 py-2 border border-yellow-400/20 text-[#c8b882]/70 rounded-xl text-sm hover:border-yellow-400/40 transition">
                Cancelar
              </button>
              <button type="button" onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-500 transition flex items-center gap-2 disabled:opacity-60">
                {deleting ? 'Eliminando...' : 'Si, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE SERVICIO MODAL ══ */}
      {deleteServicioTarget && (
        <div className="fixed inset-0 z-[500] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a1c10] border border-red-500/20 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <FaExclamationTriangle size={24} />
              <h3 className="text-lg font-bold text-[#f0ead6]">Eliminar servicio</h3>
            </div>
            <p className="text-sm text-[#b4c8b9]/70 mb-2">
              Estas a punto de eliminar el servicio <strong className="text-[#e8dfc8]">{deleteServicioTarget.nombre}</strong>.
            </p>
            <p className="text-xs text-[#b4c8b9]/45 mb-6">
              Se removera automaticamente de todos los parques que lo tengan asignado.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteServicioTarget(null)} disabled={deletingServicio}
                className="px-4 py-2 border border-yellow-400/20 text-[#c8b882]/70 rounded-xl text-sm hover:border-yellow-400/40 transition">
                Cancelar
              </button>
              <button type="button" onClick={handleDeleteServicio} disabled={deletingServicio}
                className="px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-500 transition flex items-center gap-2 disabled:opacity-60">
                {deletingServicio ? 'Eliminando...' : 'Si, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}