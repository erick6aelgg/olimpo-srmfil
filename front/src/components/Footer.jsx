import { PiSparkleFill } from "react-icons/pi";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { MdMail } from "react-icons/md";
import { Link } from "react-router-dom";
import Logo from "../assets/img/Logo.png";
import Olimpo from "../assets/img/Olimpo.png";

/**
 * Componente Footer.
 * Presenta el pie de página de la aplicación con un diseño de rejilla (Grid) responsivo.
 * Incluye la marca del festival, redes sociales, enlaces de navegación interna y políticas.
 */
export const Footer = () => {
  return (
    /**
     * CONTENEDOR PRINCIPAL DEL FOOTER
     * - border-t border-yellow-500/20: Delgada línea superior con tonalidad dorada y opacidad del 20%.
     * - mt-auto: Propiedad clave combinada con Flexbox en el Layout para empujar el footer hacia abajo (Sticky Footer).
     */
    <footer className="bg-[#050e08] backdrop-blur-sm border-t border-yellow-500/20 mt-auto text-white">
      {/* Contenedor con límites de ancho máximo y alineación centrada */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
       { /**
         * REJILLA RESPONSIVA (GRID)
         * - grid-cols-1: Una columna por defecto en pantallas móviles.
         * - md:grid-cols-4: Se transforma en 4 columnas a partir de pantallas medianas (tabletas/monitores).
         * - gap-8: Separación uniforme entre las columnas de la rejilla.
         */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* COLUMNA 1 Y 2: LOGO, DESCRIPCIÓN Y REDES SOCIALES */}
          <div className="col-span-1 md:col-span-2">
            {/* Identidad de la Marca */}
            <div className="flex items-center gap-2 mb-4">
              <img src={Olimpo} alt="Logo Olimpo" className="h-10 md:h-14 w-auto"/>
              <img src={Logo} alt="Logo" className="h-10 md:h-14 w-auto"/>
              <div className="flex flex-col">
                <span className="font-semibold text-white text-sm leading-tight">
                  Festival Internacional
                </span>
                <span className="text-yellow-500 text-xs leading-tight">
                  Luciérnagas 2026
                </span>
              </div>
            </div>
            
            {/* Reseña introductoria del evento */}
            <p className="text-white/70 text-sm mb-4 max-w-md leading-relaxed">
              Descubre la magia de las luciérnagas en los bosques de México. Una experiencia
              nocturna única que conecta con la naturaleza y preserva el ecosistema.
            </p>
            
            {/* Botonera de Redes Sociales con efectos de transición en hover */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-yellow-500/5 flex items-center justify-center cursor-not-allowed opacity-50 grayscale">
                <FaFacebook className="w-5 h-5 text-yellow-500" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-yellow-500/5 flex items-center justify-center cursor-not-allowed opacity-50 grayscale">
                <FaInstagram className="w-5 h-5 text-yellow-500" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-yellow-500/5 flex items-center justify-center cursor-not-allowed opacity-50 grayscale">
                <FaTwitter className="w-5 h-5 text-yellow-500" />
              </a>
              <a href="mailto:srmfilbyolimpo@gmail.com" className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center hover:bg-yellow-500/20 transition-colors">
                <MdMail className="w-5 h-5 text-yellow-500" />
              </a>
            </div>
          </div>

          {/* COLUMNA 3: ENLACES RÁPIDOS DE NAVEGACIÓN */}
          <div>
            <h3 className="text-white/60 font-semibold mb-4 leading-relaxed">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              {/* Se utilizan componentes <Link> para las rutas controladas por la SPA (React Router) */}
              <li>
                <Link to="/" className="text-gray-500 hover:text-yellow-500 text-sm transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/parques" className="text-gray-500 hover:text-yellow-500 text-sm transition-colors">
                  Parques
                </Link>
              </li>
              {/* Se usan etiquetas <a> tradicionales para enlaces ancla internos o secciones pendientes */}
              <li>
                <a href="#" className="text-gray-500 cursor-not-allowed text-sm transition-colors grayscale">
                  Acerca de
                </a>
              </li>
              <li>
                <a href="mailto:srmfilbyolimpo@gmail.com" className="text-gray-500 hover:text-yellow-500 text-sm transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMNA 4: INFORMACIÓN LEGAL Y TURÍSTICA */}
          <div>
            <h3 className="text-white/60 font-semibold mb-4 leading-relaxed">Información</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" 
                  className="text-gray-500/40 cursor-not-allowed text-sm transition-colors grayscale">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <a href="#" 
                className="text-gray-500/40 cursor-not-allowed text-sm transition-colors grayscale">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500/40 cursor-not-allowed text-sm transition-colors grayscale">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500/40 cursor-not-allowed text-sm transition-colors grayscale">
                  Consejos para Visitantes
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* SECCIÓN INFERIOR: SEPARADOR Y DERECHOS DE AUTOR */}
        <div className="border-t border-yellow-500/20 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 Festival Internacional de las Luciérnagas. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};