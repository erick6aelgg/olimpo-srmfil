import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "./utils";

/**
 * CONFIGURACIÓN DE VARIANTES: buttonVariants
 * Utiliza 'class-variance-authority' para estructurar un sistema de diseño limpio basado en tokens.
 * Permite combinar de manera segura estados (hover, focus, disabled) con variantes visuales y tamaños.
 */
const buttonVariants = cva(
  /**
   * Estilos Base (Aplicados a absolutamente todos los botones):
   * - inline-flex items-center justify-center gap-2: Alineación horizontal perfecta para texto e iconos con separación nativa.
   * - [&_svg]:pointer-events-none: Evita que los iconos internos interfieran con los eventos de clic del puntero.
   * - [&_svg:not([class*='size-'])]:size-4: Pseudo-selector que fuerza a cualquier SVG interno a medir 16px (size-4) A MENOS que se le pase una clase explícita de tamaño (ej. size-5).
   * - focus-visible:ring-[3px]: Anillo de enfoque moderno y accesible que solo se activa al navegar con el teclado.
   * - aria-invalid:*: Estilos automáticos de error si el botón es marcado como inválido por componentes de formulario o lectores de pantalla.
   */
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    // Definición de las dimensiones visuales (modificadores)
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        /**
         * has-[>svg]: Pseudo-selector de Tailwind. Si el botón tiene un SVG como hijo directo,
         * reduce sutilmente el padding horizontal (px) para mantener el equilibrio óptimo del diseño.
         */
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md", // Tamaño cuadrado perfecto (ej. 36px por 36px) ideal para botones que solo contienen un icono.
      },
    },
    // Valores aplicados en caso de que el desarrollador no especifique ninguno al instanciar el botón
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * COMPONENTE REUTILIZABLE: Button
 * * @param {string} variant - Estilo visual del botón ('default', 'outline', 'ghost', etc.)
 * @param {string} size - Dimensión del botón ('default', 'sm', 'lg', 'icon')
 * @param {boolean} asChild - Patrón polimórfico. Si es verdadero, el botón delega el renderizado y las propiedades
 * al componente hijo inmediato usando el Slot de Radix UI (ej. útil para transformar un <Link> de react-router en un botón).
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  // Selección dinámica de la etiqueta HTML o el contenedor virtual Slot
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button" // Identificador semántico para pruebas o selectores CSS complejos
      // cn() fusiona las variantes del CVA con cualquier clase extra inyectada en caliente por el desarrollador
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };