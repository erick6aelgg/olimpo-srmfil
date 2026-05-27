import { PiSparkleFill } from "react-icons/pi";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { MdMail } from "react-icons/md";
import { Link } from "react-router-dom";
import Logo from "../assets/img/Logo.png";

export const Footer = () => {
  return (
    <footer className="bg-[#050e08] backdrop-blur-sm border-t border-yellow-500/20 mt-auto text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Logo y Descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
             <img src={Logo} alt="Logo Olimpo" className="h-10 md:h-14 w-auto"/>
              <div className="flex flex-col">
                <span className="font-semibold text-white text-sm leading-tight">
                  Festival Internacional
                </span>
                <span className="text-yellow-500 text-xs leading-tight">
                  Luciérnagas 2026
                </span>
              </div>
            </div>
            <p className="text-white/70 text-sm mb-4 max-w-md leading-relaxed">
              Descubre la magia de las luciérnagas en los bosques de Tlaxcala. Una experiencia
              nocturna única que conecta con la naturaleza y preserva el ecosistema.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center hover:bg-yellow-500/20 transition-colors">
                <FaFacebook className="w-5 h-5 text-yellow-500" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center hover:bg-yellow-500/20 transition-colors">
                <FaInstagram className="w-5 h-5 text-yellow-500" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center hover:bg-yellow-500/20 transition-colors">
                <FaTwitter className="w-5 h-5 text-yellow-500" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center hover:bg-yellow-500/20 transition-colors">
                <MdMail className="w-5 h-5 text-yellow-500" />
              </a>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="text-white/60 font-semibold mb-4 leading-relaxed">Enlaces Rápidos</h3>
            <ul className="space-y-2">
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
              <li>
                <a href="#" className="text-gray-500 hover:text-yellow-500 text-sm transition-colors">
                  Acerca de
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-yellow-500 text-sm transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Información */}
          <div>
            <h3 className="text-white/60 font-semibold mb-4 leading-relaxed">Información</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-500 hover:text-yellow-500 text-sm transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-yellow-500 text-sm transition-colors">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-yellow-500 text-sm transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-yellow-500 text-sm transition-colors">
                  Consejos para Visitantes
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-yellow-500/20 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 Festival Internacional de las Luciérnagas. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};