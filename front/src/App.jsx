import './App.css'
import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ScrollToTop from './components/ScrollTop';

// Componentes estructurales (Wrappers)
import { Layout } from './components/Layout';

// Vistas y Páginas de la aplicación
import Login from "./pages/Login";
import Register from './pages/Register';
import Parques from './pages/Parques';
import MisReservaciones from './pages/MisReservaciones';
import AdminDashboard from './pages/AdminDashboard';
import { Home } from './components/Home';

/**
 * Guard / Filtro: ClientRoute
 * Propósito: Exclusivo para vistas destinadas a usuarios estándar (clientes) o invitados.
 * Comportamiento: Si un administrador intenta entrar a estas vistas, lo redirige de forma
 * automática a su panel de control (/admin) para evitar mezclar interfaces.
 */
function ClientRoute({ children }) {
  const { user, loading } = useAuth()

  // Evita parpadeos o redirecciones en falso mientras se recupera la sesión del localStorage
  if (loading) return null

  if (user?.tipo_usuario === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return children
}

/**
 * Guard / Filtro: PrivateRoute
 * Propósito: Restringir accesos a usuarios invitados (no logueados).
 * Comportamiento: Si no hay un usuario en el contexto, bloquea la vista y lo redirige al formulario de Login.
 */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null

  return user ? children : <Navigate to="/login" replace />
}

/**
 * Guard / Filtro: AdminRoute
 * Propósito: Blindar los endpoints y vistas sensibles del Administrador.
 * Comportamiento:
 * 1. Si no está logueado, va al /login.
 * 2. Si está logueado pero no tiene rol 'admin', lo rebota a la raíz pública (/).
 */
function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.tipo_usuario !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    // 1. Inyección del contexto global de autenticación en toda la app
    <AuthProvider>
      {/* 2. HashRouter: Enrutador basado en hashes (#/). 
        Ideal para despliegues estáticos (como GitHub Pages) ya que evita problemas de 404 al recargar rutas.
      */}
      <HashRouter>
        <ScrollToTop /> 
        <Routes>

          {/* GRUPO DE SITIO PÚBLICO: Comparte la misma estructura visual (Navbar, Footer) a través de <Layout /> */}
          <Route element={<Layout />}>

            {/* Inicio: Solo visible para clientes o invitados */}
            <Route
              path="/"
              element={
                <ClientRoute>
                  <Home />
                </ClientRoute>
              }
            />

            {/* Catálogo de Parques */}
            <Route
              path="/parques"
              element={
                <ClientRoute>
                  <Parques />
                </ClientRoute>
              }
            />

            {/* Panel de reservas: Doble verificación (Debe estar logueado Y no debe ser admin) */}
            <Route
              path="/reservar"
              element={
                <PrivateRoute>
                  <ClientRoute>
                    <MisReservaciones />
                  </ClientRoute>
                </PrivateRoute>
              }
            />

            {/* Rutas de autenticación libres (sin layouts o guards complejos) */}
            <Route path="/login" element={<Login />} />
            <Route path="/registrarse" element={<Register />} />
                      <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          </Route>

          {/* SECCIÓN ADMINISTRATIVA: Renderizado independiente sin el Layout común del cliente */}


          {/* CATCH-ALL: Comportamiento ante URLs rotas o inexistentes, redirige siempre al Home seguro */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default App