import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { 
  Menu, 
  X, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ClipboardList, 
  UserPlus, 
  LogIn 
} from "lucide-react";
import Logo from "../assets/img/Logo.png";
import { useAuth } from "../context/AuthContext";

/**
 * Componente Navbar.
 * Presenta una barra de navegación fija y responsiva con soporte para manejo de sesiones,
 * roles de usuario (cliente/admin) e integración con enrutamiento por hash.
 */
export const Navbar = () => {
  // Hooks de control de rutas e historial de navegación
  const location = useLocation();
  const navigate = useNavigate();
  
  // Consumo del estado global de autenticación
  const { user, logout } = useAuth();
  
  // --- ESTADOS LOCALES DE INTERFAZ ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Despliegue del menú colapsable móvil
  const [userMenuOpen, setUserMenuOpen] = useState(false);     // Despliegue del menú dropdown de usuario
  
  // Referencia mutable vinculada al contenedor del dropdown para detectar clics fuera de él
  const userMenuRef = useRef(null);

  // Matriz de configuración para los enlaces principales del menú
  const menu = [
    { id: 1, name: "Inicio", href: "/" },
    { id: 2, name: "Parques", href: "/parques" },
    { id: 3, name: "Reservar", href: "/reservar" },
  ];

  /**
   * Determina si una ruta coincide con la ubicación actual para aplicar estilos activos.
   * Funciona nativamente con HashRouter ya que location.pathname extrae el segmento posterior al '#'.
   */
  const isActive = (href) => location.pathname === href;

  /**
   * Genera de manera segura las iniciales del usuario autenticado (Nombre + Apellido Paterno).
   * En caso de ausencia o nulidad de propiedades del objeto user, recurre a fallbacks o retorna '?'.
   */
  const initials = user
    ? `${user.first_name?.[0] || ''}${(user.apellido_p || user.last_name)?.[0] || ''}`.toUpperCase() || '?'
    : '?';

  /**
   * EFECTO: Event Listener de clics globales (Click Outside Pattern).
   * Al hacer clic en cualquier sección del DOM externa al dropdown abierto, fuerza su cierre.
   */
  useEffect(() => {
    const h = (e) => {
      // Verifica si existe la referencia y si el elemento cliqueado NO está contenido dentro del menú
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    // Limpieza del listener al desmontar el componente para evitar memory leaks
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /**
   * Orquesta la desconexión del usuario, resetea los estados de menús y redirige al login.
   */
  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    // Contenedor principal de la barra con efecto difuminado (backdrop-blur) y posicionamiento fijo superior
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#05100a]/90 backdrop-blur-md border-b border-yellow-400/10 font-serif">

      <div className="px-4 md:px-8">
        <div className="flex items-center justify-between h-16">

          {/* SINOPSIS DE MARCA / LOGO */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img src={Logo} className="h-9 md:h-12 w-auto" alt="Logo" />
            <div className="flex flex-col leading-tight">
              <span className="text-white text-xs md:text-sm font-semibold">Festival Internacional</span>
              <span className="text-yellow-500 text-[10px] md:text-xs">Luciérnagas 2026</span>
            </div>
          </Link>

          {/* VISTA DE ESCRITORIO (DESKTOP MENU) */}
          <div className="hidden md:flex items-center gap-2">
            {/* Renderizado dinámico de la botonera principal */}
            {menu.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className={`px-4 py-2 rounded-lg text-sm transition-all border
                  ${isActive(item.href)
                    ? "bg-yellow-500/10 text-yellow-500 border-yellow-400/20"
                    : "text-slate-400 border-transparent hover:text-yellow-500 hover:bg-yellow-500/8"
                  }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Enlace condicional exclusivo para administradores */}
            {user?.tipo_usuario === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-yellow-400 border border-yellow-400/30 bg-yellow-400/8 hover:bg-yellow-400/15 transition-all"
              >
                <Settings size={14} /> Admin
              </Link>
            )}

            {/* ENLACES PARA VISITANTES SIN SESIÓN ACTIVA */}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-white bg-yellow-500/40 hover:bg-yellow-500/80 transition-all"
                >
                  <LogIn size={14} /> Iniciar Sesión
                </Link>
                <Link
                  to="/registrarse"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-slate-400 border-2 border-yellow-400 hover:text-yellow-500 hover:border-white transition-all"
                >
                  <UserPlus size={14} /> Registrarse
                </Link>
              </>
            )}

            {/* CONTROL DE PERFIL PARA USUARIOS AUTENTICADOS (AVATAR + DROPDOWN) */}
            {user && (
              <div className="relative" ref={userMenuRef}>
                {/* Botón disparador del menú de usuario */}
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-yellow-400/20 bg-yellow-400/8 hover:bg-yellow-400/15 transition-all"
                >
                  {/* Círculo contenedor de iniciales */}
                  <div className="w-7 h-7 rounded-full bg-yellow-400/15 border border-yellow-400/35 text-yellow-400 text-xs font-bold flex items-center justify-center">
                    {initials}
                  </div>
                  <span className="text-sm text-[#e8dfc8] font-medium">{user.first_name}</span>
                  {/* Icono de flecha con rotación animada según estado de apertura */}
                  <ChevronDown className={`w-4 h-4 text-yellow-400/60 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown flotante absoluto */}
                {userMenuOpen && (
                  <div className="absolute top-12 right-0 w-52 bg-[#0d2418] border border-yellow-500/20 rounded-2xl p-2 shadow-2xl">
                    {/* Ficha técnica informativa corta */}
                    <div className="px-3 py-2 border-b border-yellow-500/10 mb-1">
                      <p className="text-sm font-medium text-[#e8dfc8]">{user.first_name} {user.apellido_p}</p>
                      <p className="text-xs text-[#b4c8b9]/45 mt-0.5 truncate">{user.email}</p>
                    </div>
                    
                    <Link
                      to="/reservar"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[#c8b882]/70 hover:bg-yellow-400/8 hover:text-[#e8dfc8] transition"
                    >
                      <ClipboardList size={14} /> Mis reservaciones
                    </Link>
                    
                    {user.tipo_usuario === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-yellow-400/70 hover:bg-yellow-400/8 hover:text-yellow-400 transition"
                      >
                        <Settings size={14} /> Panel admin
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition"
                    >
                      <LogOut size={14} /> Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DISPARADOR MOVIL (HAMBURGER BUTTON) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-yellow-500 p-1"
          >
            {/* Alterna dinámicamente entre el icono de Menú de hamburguesa y la X de cierre */}
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* VISTA MÓVIL (MOBILE MENU COLLAPSIBLE) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-yellow-400/10 bg-[#05100a]/95 backdrop-blur-md">
          <div className="flex flex-col items-center text-center py-6 gap-3">

            {/* Enlaces repetidos en formato bloque vertical */}
            {menu.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)} // Cierra el contenedor al hacer clic
                className={`text-sm font-medium px-4 py-2.5 rounded-xl w-4/5 transition-all
                  ${isActive(item.href)
                    ? "text-yellow-500 bg-yellow-500/10 border border-yellow-400/20"
                    : "text-slate-400 hover:text-yellow-500 hover:bg-yellow-500/5"
                  }`}
              >
                {item.name}
              </Link>
            ))}

            {user?.tipo_usuario === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-4/5 text-center px-4 py-2.5 rounded-xl text-sm text-yellow-400 border border-yellow-400/30 bg-yellow-400/8"
              >
                <Settings size={15} /> Panel admin
              </Link>
            )}

            {/* Estructura móvil condicional según sesión */}
            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-4/5 text-center px-4 py-2.5 rounded-xl text-sm text-white bg-yellow-500/40 hover:bg-yellow-500/80"
                >
                  <LogIn size={15} /> Iniciar Sesión
                </Link>
                <Link
                  to="/registrarse"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-4/5 text-center px-4 py-2.5 rounded-xl text-sm text-slate-400 border-2 border-yellow-400 hover:text-yellow-500"
                >
                  <UserPlus size={15} /> Registrarse
                </Link>
              </>
            ) : (
              <>
                {/* Bloque informativo de perfil móvil */}
                <div className="w-4/5 px-4 py-2 border-t border-yellow-500/10 text-center">
                  <p className="text-sm text-[#e8dfc8] font-medium">{user.first_name} {user.apellido_p}</p>
                  <p className="text-xs text-[#b4c8b9]/45 truncate">{user.email}</p>
                </div>
                
                <Link
                  to="/reservar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-4/5 text-center px-4 py-2.5 rounded-xl text-sm text-[#c8b882]/70 hover:bg-yellow-400/8 border border-yellow-400/10"
                >
                  <ClipboardList size={15} /> Mis reservaciones
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-4/5 text-center px-4 py-2.5 rounded-xl text-sm text-red-400/70 border border-red-400/20 hover:bg-red-500/10"
                >
                  <LogOut size={15} /> Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};