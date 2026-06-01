import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Componente Wrapper estructural (Layout principal).
 * Propósito: Define la arquitectura de bloques común para el sitio público de la aplicación.
 * Provee un contenedor flexible con comportamiento adaptable según el tipo de usuario.
 */
export const Layout = () => {
  // Extrae los datos del usuario autenticado desde el contexto global
  const { user } = useAuth();

  /**
   * RENDERIZADO CONDICIONAL DE ROL
   * Si el usuario logueado posee el rol de 'admin', se anula por completo la interfaz del cliente.
   * Retorna directamente el <Outlet />, permitiendo que la vista administrativa se despliegue 
   * en pantalla completa limpia sin heredar el Navbar ni el Footer convencionales.
   */
  if (user?.tipo_usuario === "admin") {
    return <Outlet />;
  }

  return (
    /**
     * CONTENEDOR FLEXBOX VERTICAL (Sticky Footer Behavior)
     * - min-h-screen: Garantiza que el div ocupe al menos el 100% de la altura de la pantalla (viewport).
     * - flex-col: Alinea los elementos internos (Navbar, Main, Footer) en un eje vertical.
     */
    <div className="flex flex-col min-h-screen">
      
      {/* Barra de navegación superior fija */}
      <Navbar />

      <main className="flex-grow pt-16">
        {/**
         * <Outlet /> es el marcador de posición (placeholder) de react-router-dom.
         * Renderiza el componente de la ruta hija que coincida con la URL actual en App.jsx
         * (Por ejemplo: <Home />, <Parques /> o <MisReservaciones />).
         */}
        <Outlet />
      </main>

      {/* Pie de página común */}
      <Footer />
      
    </div>
  );
};