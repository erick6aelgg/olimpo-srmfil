import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export const FireflyEffect = ({ count = 20 }) => {
  const canvasRef = useRef(null);
  const firefliesRef = useRef([]);
  const animationFrameRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    // Initialize fireflies
    firefliesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random(),
      opacityDirection: Math.random() > 0.5 ? 0.01 : -0.01,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      firefliesRef.current.forEach((firefly) => {
        // Update position
        firefly.x += firefly.vx;
        firefly.y += firefly.vy;

        // Bounce off edges
        if (firefly.x < 0 || firefly.x > canvas.width) firefly.vx *= -1;
        if (firefly.y < 0 || firefly.y > canvas.height) firefly.vy *= -1;

        // Opacity pulse
        firefly.opacity += firefly.opacityDirection;
        if (firefly.opacity <= 0.2 || firefly.opacity >= 1) {
          firefly.opacityDirection *= -1;
        }

        // Glow
        const gradient = ctx.createRadialGradient(
          firefly.x,
          firefly.y,
          0,
          firefly.x,
          firefly.y,
          firefly.size * 8
        );

        gradient.addColorStop(
          0,
          `rgba(244, 224, 77, ${firefly.opacity})`
        );
        gradient.addColorStop(
          0.5,
          `rgba(244, 224, 77, ${firefly.opacity * 0.3})`
        );
        gradient.addColorStop(1, "rgba(244, 224, 77, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(firefly.x, firefly.y, firefly.size * 8, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(255, 255, 255, ${firefly.opacity})`;
        ctx.beginPath();
        ctx.arc(firefly.x, firefly.y, firefly.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

// Static firefly decorations for sections
export const FireflyDecoration = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-[#f4e04d]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: "0 0 20px rgba(244, 224, 77, 0.8)",
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};