import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * Componente FireflyEffect.
 * Genera un sistema de partículas dinámico e interactivo en pantalla completa usando HTML5 Canvas.
 * Simula el comportamiento natural de las luciérnagas (vuelo aleatorio y parpadeo lumínico).
 * 
 * @param {number} count - Cantidad de luciérnagas simultáneas en pantalla.
 */
export const FireflyEffect = ({ count = 20 }) => {
  const canvasRef = useRef(null);
  
  // firefliesRef contiene el estado de las partículas fuera del ciclo de renderizado de React
  // para evitar re-renders costosos a 60fps (frames por segundo).
  const firefliesRef = useRef([]);
  
  // Guarda el ID de la animación para poder cancelarla limpiamente al desmontar el componente.
  const animationFrameRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /**
     * Ajusta el tamaño del lienzo en píxeles al tamaño exacto de la ventana del navegador.
     */
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    /**
     * Inicialización del sistema de partículas.
     * Crea un arreglo de objetos que definen las propiedades físicas y visuales de cada luciérnaga.
     */
    firefliesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,               // Posición X inicial aleatoria
      y: Math.random() * canvas.height,              // Posición Y inicial aleatoria
      vx: (Math.random() - 0.5) * 0.5,               // Vector de velocidad X (dirección e intensidad)
      vy: (Math.random() - 0.5) * 0.5,               // Vector de velocidad Y
      size: Math.random() * 2 + 1,                   // Radio base del núcleo de la luciérnaga
      opacity: Math.random(),                        // Opacidad inicial aleatoria para desincronizar el parpadeo
      opacityDirection: Math.random() > 0.5 ? 0.01 : -0.01, // Sentido del pulso (brillando o apagándose)
    }));

    /**
     * Ciclo de renderizado continuo (Render Loop).
     * Se ejecuta de forma síncrona con la tasa de refresco del monitor gracias a requestAnimationFrame.
     */
    const animate = () => {
      // Limpia todo el canvas antes de dibujar el siguiente frame para evitar estelas físicas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      firefliesRef.current.forEach((firefly) => {
        // 1. ACTUALIZACIÓN DE POSICIÓN (Física básica de vectores)
        firefly.x += firefly.vx;
        firefly.y += firefly.vy;

        // 2. DETECCIÓN DE COLISIONES CON LOS BORDES (Efecto Rebote)
        if (firefly.x < 0 || firefly.x > canvas.width) firefly.vx *= -1;
        if (firefly.y < 0 || firefly.y > canvas.height) firefly.vy *= -1;

        // 3. LOGICA DEL PULSO DE OPACIDAD (Efecto de encendido/apagado)
        firefly.opacity += firefly.opacityDirection;
        // Si llega a los límites del umbral visual, invierte el signo algebraico del incremento
        if (firefly.opacity <= 0.2 || firefly.opacity >= 1) {
          firefly.opacityDirection *= -1;
        }

        // 4. RENDERIZADO DEL AURA / GLOW (Gradiente Radial)
        // Crea un círculo con difuminado donde el centro es dorado brillante y los bordes son transparentes
        const gradient = ctx.createRadialGradient(
          firefly.x,
          firefly.y,
          0,
          firefly.x,
          firefly.y,
          firefly.size * 8 // El halo de luz se expande hasta 8 veces el tamaño real del núcleo
        );

        // Capas del gradiente
        gradient.addColorStop(0, `rgba(244, 224, 77, ${firefly.opacity})`);
        gradient.addColorStop(0.5, `rgba(244, 224, 77, ${firefly.opacity * 0.3})`);
        gradient.addColorStop(1, "rgba(244, 224, 77, 0)"); // Transparencia absoluta en el borde exterior

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(firefly.x, firefly.y, firefly.size * 8, 0, Math.PI * 2);
        ctx.fill();

        // 5. RENDERIZADO DEL NÚCLEO (Core sólido interno)
        // Dibuja un punto blanco central brillante para darle profundidad realista a la partícula
        ctx.fillStyle = `rgba(255, 255, 255, ${firefly.opacity})`;
        ctx.beginPath();
        ctx.arc(firefly.x, firefly.y, firefly.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Solicita al navegador agendar el siguiente rediseño visual
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Dispara la primera iteración del bucle
    animate();

    // LIMPIEZA (Cleanup Function)
    return () => {
      window.removeEventListener("resize", updateSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current); // Detiene el bucle para evitar fugas de memoria
      }
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      // fixed inset-0 y pointer-events-none garantizan que el fondo flote detrás de la app sin bloquear clics ni scrolls
      className="fixed inset-0 pointer-events-none z-10"
      // mixBlendMode: screen fusiona el brillo del canvas de manera óptima con fondos oscuros
      style={{ mixBlendMode: "screen" }}
    />
  );
};

/**
 * Componente FireflyDecoration.
 * Genera un grupo estático de 5 partículas CSS ornamentales basadas en nodos DOM directos.
 * Útil para decorar contenedores y secciones específicas (como el Hero o tarjetas de presentación).
 * Utiliza Framer Motion para simplificar las animaciones de escala y opacidad con desfases de tiempo.
 */
export const FireflyDecoration = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-[#f4e04d]"
          style={{
            // Distribución geográfica aleatoria por porcentajes dentro del contenedor padre
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            // Sombra paralela CSS para simular la iluminación ambiental de la partícula
            boxShadow: "0 0 20px rgba(244, 224, 77, 0.8)",
          }}
          // Ciclo infinito de keyframes de Framer Motion
          animate={{
            opacity: [0.3, 1, 0.3], // Transición repetitiva de opacidad
            scale: [0.8, 1.2, 0.8], // Transición repetitiva de escala (efecto de respiración)
          }}
          transition={{
            duration: 2 + Math.random() * 2, // Tiempo de ciclo asíncrono para cada partícula
            repeat: Infinity,                // Ciclo infinito
            delay: Math.random() * 2,        // Retraso de arranque aleatorio para romper la simetría visual
          }}
        />
      ))}
    </div>
  );
};