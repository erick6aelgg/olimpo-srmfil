// Hooks de React para manejar estado y efectos secundarios
import { useState, useEffect } from 'react'

// Componente para navegación entre rutas
import { Link } from 'react-router-dom'

// Hook personalizado para obtener información del usuario autenticado
import { useAuth } from '../context/AuthContext'

// Instancia de Axios configurada para consumir la API
import api from '../services/api'

// Importación de iconos de Lucide React
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

/*
 * Convierte una fecha a formato legible en español.
 * Ejemplo:
 * 2025-06-15 -> 15 de junio de 2025
 */
const fmtDate = (d) => {
  if (!d) return '—'

  return new Date(d + 'T00:00:00').toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

/*
 * Calcula la cantidad de noches entre dos fechas.
 * Se usa para mostrar la duración de la reservación.
 */
const diffDays = (a, b) => {
  const d1 = new Date(a)
  const d2 = new Date(b)

  return Math.max(
    1,
    Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24))
  )
}

/*
 * Etiquetas legibles para los estados de reservación
 */
const STATUS_LABEL = {
  activa: 'Activa',
  cancelada: 'Cancelada',
  completada: 'Completada',
}

/*
 * Clases CSS para cada estado.
 * Permiten cambiar colores y estilos visuales.
 */
const STATUS_CLASS = {
  activa:
    'border border-[rgba(30,160,80,.25)] bg-[rgba(30,160,80,.15)] text-[#6de89a]',

  cancelada:
    'border border-[rgba(240,80,80,.2)] bg-[rgba(240,80,80,.1)] text-[#f07070]',

  completada:
    'border border-[rgba(245,194,0,.2)] bg-[rgba(245,194,0,.1)] text-[#f5c200]',
}

// Componente principal
export default function MisReservaciones() {

  // Obtiene información del usuario autenticado
  const { user } = useAuth()

  /*
   * Estados del componente
   */

  // Lista completa de reservaciones
  const [reservaciones, setReservaciones] = useState([])

  // Estado de carga
  const [loading, setLoading] = useState(true)

  // Mensaje de error
  const [error, setError] = useState('')

  // Reservación seleccionada para cancelar
  const [cancelTarget, setCancelTarget] = useState(null)

  // Estado mientras se realiza la cancelación
  const [cancelling, setCancelling] = useState(false)

  // Mensaje de éxito o error después de cancelar
  const [cancelMsg, setCancelMsg] = useState('')

  /*
   * Obtiene las reservaciones del usuario desde la API
   */
  const fetchReservaciones = () => {

    // Si no existe usuario no hace nada
    if (!user?.id) return

    setLoading(true)

    api
      .get(`/api/reservations/user/${user.id}/`)

      .then(({ data }) =>
        setReservaciones(
          Array.isArray(data)
            ? data
            : data.results || []
        )
      )

      .catch(() =>
        setError(
          'No se pudieron cargar tus reservaciones.'
        )
      )

      .finally(() => setLoading(false))
  }

  /*
   * Se ejecuta cuando el componente carga
   * o cuando cambia el usuario.
   */
  useEffect(() => {
    fetchReservaciones()
  }, [user])

  /*
   * Cancela una reservación
   */
  const handleCancel = async () => {

    // Si no hay reservación seleccionada
    if (!cancelTarget) return

    setCancelling(true)

    try {

      // Llamada al endpoint para cancelar
      await api.patch(
        `/api/reservations/${cancelTarget.id}/cancel/`
      )

      // Mensaje de éxito
      setCancelMsg(
        'Reservación cancelada exitosamente.'
      )

      // Cierra modal
      setCancelTarget(null)

      // Recarga información
      fetchReservaciones()

    } catch {

      // Mensaje de error
      setCancelMsg(
        'No se pudo cancelar. Intenta de nuevo.'
      )

    } finally {

      setCancelling(false)

    }
  }

  /*
   * Obtiene únicamente las reservaciones activas
   */
  const activas = reservaciones.filter((r) => {
    const estado = r.estatus || r.estado
    return estado === 'activa'
  })

  /*
   * Obtiene reservaciones canceladas o completadas
   */
  const historial = reservaciones.filter((r) => {
    const estado = r.estatus || r.estado
    return estado && estado !== 'activa'
  })

  return (

    /*
     * Contenedor principal de la página
     */
    <div className="min-h-screen bg-[#05100a] font-sans text-[#e8dfc8]">

      <main className="mx-auto max-w-[900px] px-8 py-10 md:px-4">

        {/* ===================== */}
        {/* ENCABEZADO DE PÁGINA */}
        {/* ===================== */}

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">

          <div>
            <h1>
              Mis reservaciones
            </h1>

            <p>
              Gestiona tus visitas al festival
            </p>
          </div>

          {/* Botón para crear una nueva reservación */}
          <Link to="/parques">
            <Sparkles size={14} />
            Nueva reservación
          </Link>

        </div>

        {/* ===================== */}
        {/* MENSAJE DE ÉXITO */}
        {/* ===================== */}

        {cancelMsg && (
          <div>

            <span>{cancelMsg}</span>

            {/* Cierra alerta */}
            <button
              onClick={() => setCancelMsg('')}
            >
              <X size={16} />
            </button>

          </div>
        )}

        {/* ===================== */}
        {/* MENSAJE DE ERROR */}
        {/* ===================== */}

        {error && (
          <div>
            {error}
          </div>
        )}

        {/* ===================== */}
        {/* TARJETAS DE ESTADÍSTICAS */}
        {/* ===================== */}

        <div>

          {/* Total de reservaciones */}
          <div>
            <p>{reservaciones.length}</p>
            <span>Total</span>
          </div>

          {/* Reservaciones activas */}
          <div>
            <p>{activas.length}</p>
            <span>Activas</span>
          </div>

          {/* Historial */}
          <div>
            <p>{historial.length}</p>
            <span>Historial</span>
          </div>

        </div>

        {/* ===================== */}
        {/* LOADER */}
        {/* ===================== */}

        {loading && (
          <div>

            {/* Spinner animado */}
            <Loader2
              size={32}
              className="animate-spin"
            />

            <p>
              Cargando reservaciones...
            </p>

          </div>
        )}

        {/* ===================== */}
        {/* RESERVACIONES ACTIVAS */}
        {/* ===================== */}

        {!loading && activas.length > 0 && (

          <section>

            <h2>
              Reservaciones activas
            </h2>

            {activas.map((r) => (

              <div key={r.id}>

                {/* Nombre del parque */}
                <h3>
                  {r.parque_nombre || 'Parque'}
                </h3>

                {/* Tipo de hospedaje y duración */}
                <p>
                  {r.tipo_visita || 'Cabaña'}
                  {' · '}
                  {diffDays(
                    r.fecha_inicio,
                    r.fecha_fin
                  )}
                  {' noches'}
                </p>

                {/* Estado visual */}
                <span>
                  {
                    STATUS_LABEL[
                      r.estatus ||
                      r.estado ||
                      'activa'
                    ]
                  }
                </span>

                {/* Información general */}
                <div>

                  <div>
                    Entrada:
                    {fmtDate(r.fecha_inicio)}
                  </div>

                  <div>
                    Salida:
                    {fmtDate(r.fecha_fin)}
                  </div>

                  <div>
                    <Users size={13} />
                    {r.numero_personas}
                  </div>

                  <div>
                    #{r.id}
                  </div>

                </div>

                {/* Botón cancelar */}
                <button
                  onClick={() =>
                    setCancelTarget(r)
                  }
                >
                  Cancelar reservación
                </button>

              </div>

            ))}

          </section>
        )}

        {/* ===================== */}
        {/* HISTORIAL */}
        {/* ===================== */}

        {!loading && historial.length > 0 && (

          <section>

            <h2>
              Historial
            </h2>

            {historial.map((r) => (

              <div key={r.id}>

                <h3>
                  {r.parque_nombre}
                </h3>

                <span>
                  {
                    STATUS_LABEL[
                      r.estatus ||
                      r.estado
                    ]
                  }
                </span>

              </div>

            ))}

          </section>
        )}

        {/* ===================== */}
        {/* SIN RESERVACIONES */}
        {/* ===================== */}

        {!loading &&
          activas.length === 0 && (

          <div>

            <Leaf size={48} />

            <p>
              No tienes reservaciones activas.
            </p>

            <Link to="/parques">
              Explorar parques
            </Link>

          </div>
        )}

      </main>

      {/* ===================== */}
      {/* MODAL DE CANCELACIÓN */}
      {/* ===================== */}

      {cancelTarget && (

        <div>

          <div>

            <AlertTriangle size={48} />

            <h3>
              Cancelar reservación
            </h3>

            <p>
              ¿Seguro que deseas cancelar esta reservación?
            </p>

            <p>
              Esta acción no se puede deshacer.
            </p>

            {/* Cierra modal */}
            <button
              onClick={() =>
                setCancelTarget(null)
              }
            >
              No, mantener
            </button>

            {/* Ejecuta cancelación */}
            <button
              onClick={handleCancel}
              disabled={cancelling}
            >

              {cancelling && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              Sí, cancelar

            </button>

          </div>

        </div>
      )}

    </div>
  )
}