import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PiSparkleFill } from "react-icons/pi";
import { FiArrowRight, FiSearch } from "react-icons/fi";
import { Card } from "./Card";
import { FireflyDecoration } from "./FireflyEffect";
import { Button } from "./Button";
import { Search, MapPin, Star, Calendar, Users, Tent, Home as HomeIcon } from 'lucide-react';



export const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate("/parques", { state: { searchQuery } });
    }
  };

  /*const featuredParks = [
    {
      id: 1,
      name: "Parque Ejemplo 1",
      address: "CDMX",
      description: "Hermoso parque lleno de luciérnagas",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-eAIE4j9Ui-l1k7DmRPFnGoCblU9ZHmN9iQ&s",
      rating: 4.8,
      cabinCapacity: 10,
      campingCapacity: 20,
    },
    {
      id: 2,
      name: "Parque Ejemplo 2",
      address: "Puebla",
      description: "Experiencia nocturna increíble",
      imageUrl: "https://cloudfront-us-east-1.images.arcpublishing.com/eluniversal/RUF535TQYBEHFMA7A7KACG6QWM.jpg",
      rating: 4.6,
      cabinCapacity: 8,
      campingCapacity: 15,
    },
  ]; */

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative min-h-dvh flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1686937378864-38df58d421ef"
            alt="Bosque mágico con luciérnagas"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <PiSparkleFill className="h-8 w-8 text-yellow-500 animate-pulse" />
              <span className="text-yellow-500 font-medium tracking-wide">2026</span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              Festival Internacional de las Luciérnagas
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Descubre la magia de la naturaleza en una experiencia única bajo las estrellas
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link
                to="/parques"
                className="inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-lg px-8 py-3 rounded-lg transition-colors duration-200"
              >
                Explorar parques
                <FiArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/reservar"
                className="inline-flex items-center justify-center bg-white/15 hover:bg-white/25 text-white font-semibold text-lg px-8 py-3 rounded-lg border border-white/30 backdrop-blur-sm transition-colors duration-200"
              >
                Reservar ahora
              </Link>
            </div>

            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 max-w-xl mx-auto bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2"
            >
              <FiSearch className="text-white/60 h-5 w-5 shrink-0" />
              <input
                type="text"
                placeholder="Buscar parques..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-sm py-1"
              />
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium text-sm px-4 py-1.5 rounded-lg transition-colors duration-200"
              >
                Buscar
              </button>
            </form>
          </motion.div>
        </div>
      </section>
      <section className="py-20 px-4 bg-[#05100a]/90">
  <div className="max-w-7xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-12"
    >
      <h2 className="text-3xl md:text-4xl text-white mb-4">
        Parques Destacados
      </h2>
      <p className="text-gray-400 text-lg">
        Explora nuestros santuarios más populares de luciérnagas
      </p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
       {/** {featuredParks.map((park, index) => (
        <motion.div
          key={park.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="overflow-hidden bg-[#1a1f1e] border-[#f4e04d]/20 hover:border-[#f4e04d]/50 transition-all group cursor-pointer">
            <div className="relative h-64 overflow-hidden">
              <img
                src={park.imageUrl}
                alt={park.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              <div className="absolute top-4 right-4 bg-[#0a0e0d]/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="w-4 h-4 text-[#f4e04d] fill-[#f4e04d]" />
                <span className="text-white text-sm">{park.rating}</span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl text-white mb-2 group-hover:text-[#f4e04d] transition-colors">
                {park.name}
              </h3>

              <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
                <MapPin className="w-4 h-4" />
                <span>{park.address}</span>
              </div>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {park.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-400">
                    <HomeIcon className="w-4 h-4 text-[#f4e04d]" />
                    <span>{park.cabinCapacity}</span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-400">
                    <Tent className="w-4 h-4 text-[#f4e04d]" />
                    <span>{park.campingCapacity}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => navigate("/parques")} 
                  className="btn-fancy text-black  cursor-pointer"
                >
                  Ver más detalles <FiArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))} */ } 
    </div>

    <div className="text-center mt-12">
      <Button
        onClick={() => navigate("/parques")} 
        size="lg"
        variant="outline"
        className="btn-style700 cursor-pointer"
      > 
       Ver todos los parques 
      </Button>
    </div>
  </div>
      </section>
      <section className="py-20 px-4 relative overflow-hidden bg-[#050e08]">
        <FireflyDecoration />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl text-white mb-4">
              ¿Listo para la Aventura Nocturna?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Únete a miles de visitantes que han experimentado la magia de las luciérnagas.
              Temporada limitada: Junio - Agosto 2026.
            </p>
            <Button
              onClick={() => navigate("/reservar")} 
              size="lg"
              className="btn-fancy px-12 py-3 uppercase tracking-widest text-white hover:text-black cursor-pointer"
            >
              Reserva Ahora <FiArrowRight className="h-5 w-5" /> 
            </Button>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

