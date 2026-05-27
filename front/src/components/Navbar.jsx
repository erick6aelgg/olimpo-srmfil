import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "../assets/img/Logo.png";

export const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menu = [
    { id: 1, name: "Inicio", href: "/" },
    { id: 2, name: "Parques", href: "/parques" },
    { id: 3, name: "Reservar", href: "/reservar" },
  ];

  const isActive = (href) =>
    location.pathname === href || location.hash === href;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#05100a]/90 backdrop-blur-md border-b border-yellow-400/10 font-serif">
      
      {/* HEADER */}
      <div className="px-4 md:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LOGO + TITULO CENTRADO (MOBILE FIX) */}
          <Link to="/" className="flex items-center gap-3">
            <img src={Logo} className="h-9 md:h-12 w-auto" />

            {/* 👇 CENTRADO VISUAL EN MOBILE */}
            <div className="flex flex-col leading-tight text-center md:text-left">
              <span className="text-white text-xs md:text-sm font-semibold">
                Festival Internacional
              </span>
              <span className="text-yellow-500 text-[10px] md:text-xs">
                Luciérnagas 2026
              </span>
            </div>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-6">
            {menu.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className={`px-4 py-2 rounded-lg text-sm transition-all border border-transparent
                  ${
                    isActive(item.href)
                      ? "bg-yellow-500/10 text-yellow-500 border-white/15"
                      : "text-slate-400 hover:text-yellow-500 hover:bg-blue-950/15"
                  }`}
              >
                {item.name}
              </Link>
            ))}

            <Link
              to="/login"
              className="px-4 py-2 rounded-lg text-sm text-white bg-yellow-500/40 hover:bg-yellow-500/80"
            >
              Iniciar Sesión
            </Link>

            <Link
              to="/registrarse"
              className="px-4 py-2 rounded-lg text-sm text-slate-400 border-2 border-yellow-400 hover:text-yellow-500 hover:border-white"
            >
              Registrarse
            </Link>
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-yellow-500"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU STYLE MODERNO */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-yellow-400/10 bg-[#05100a]/95 backdrop-blur-md">
          
          <div className="flex flex-col items-center text-center py-6 space-y-4">

            {/* LINKS CENTRADOS */}
            {menu.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium transition-all px-4 py-2 rounded-lg w-4/5
                  ${
                    isActive(item.href)
                      ? "text-yellow-500 bg-yellow-500/10"
                      : "text-slate-400 hover:text-yellow-500"
                  }`}
              >
                {item.name}
              </Link>
            ))}

            {/* BOTONES */}
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-4/5 text-center px-4 py-2 rounded-lg text-sm text-white bg-yellow-500/40 hover:bg-yellow-500/80"
            >
              Iniciar Sesión
            </Link>

            <Link
              to="/registrarse"
              onClick={() => setMobileMenuOpen(false)}
              className="w-4/5 text-center px-4 py-2 rounded-lg text-sm text-slate-400 border-2 border-yellow-400 hover:text-yellow-500"
            >
              Registrarse
            </Link>

          </div>
        </div>
      )}
    </nav>
  );
};