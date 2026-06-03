import React from "react";
import { cn } from "./utils";

/**
 * COMPONENTE ANCLA: Card (Contenedor Principal)
 * Propósito: Define el marco estructural base para las tarjetas del sistema.
 * - data-slot: Atributo personalizado para que selectores CSS CSS de padres u otros 
 * componentes identifiquen este bloque.
 * - flex flex-col: Alinea el Header, Content y Footer de forma vertical uniforme.
 * - {...props}: Propaga nativamente cualquier propiedad HTML como onClick, id o estilos inline.
 */
function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className
      )}
      {...props}
    />
  );
}

/**
 * SUBCOMPONENTE: CardHeader (Zona de Encabezado)
 * Propósito: Distribuye el título, la descripción y posibles acciones rápidas.
 * Explicación de clases complejas de Tailwind v4:
 * - @container/card-header: Inicializa un Container Query aislado en el header para responsive local.
 * - grid grid-rows-[auto_auto]: Genera dos filas automáticas (Fila 1: Título, Fila 2: Descripción).
 * - has-data-[slot=card-action]:grid-cols-[1fr_auto]: Selector condicional moderno. Si detecta que el 
 * subcomponente <CardAction /> está renderizado en su interior, transforma el grid a dos columnas de
 * manera automática (Columna 1: Textos, Columna 2: Botón/Acción).
 * - [.border-b]:pb-6: Si el desarrollador agrega la clase estática "border-b" al header, inyecta un 
 * padding inferior automáticamente para que la línea divisoria no se pegue al texto.
 */
function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

/**
 * SUBCOMPONENTE: CardTitle (Título del bloque)
 * Propósito: Renderiza la cabecera semántica principal.
 * - leading-none: Cancela la altura de línea extra para que encaje simétricamente en el Grid del Header.
 */
function CardTitle({ className, ...props }) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none", className)}
      {...props}
    />
  );
}

/**
 * SUBCOMPONENTE: CardDescription (Subtítulo o Metadato)
 * Propósito: Renderiza textos aclaratorios o secundarios.
 * - text-muted-foreground: Aplica la tonalidad de color atenuada o grisácea configurada en el tema de variables CSS.
 */
function CardDescription({ className, ...props }) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * SUBCOMPONENTE: CardAction (Ranura para Botones/Menús en Cabecera)
 * Propósito: Posiciona elementos interactivos (como un botón de cerrar, tres puntos o un toggle) en la esquina superior derecha.
 * - col-start-2 row-span-2 row-start-1: Fuerzas físicas de CSS Grid para posicionar este div en la segunda columna,
 * abarcando verticalmente las dos filas del título y la descripción sin romper el flujo.
 * - self-start justify-self-end: Clava el componente firmemente arriba a la derecha.
 */
function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

/**
 * SUBCOMPONENTE: CardContent (Cuerpo de la Tarjeta)
 * Propósito: Contenedor general para formularios, gráficas o cualquier UI central.
 * - [&:last-child]:pb-6: Pseudo-clase dinámica muy inteligente. Si este elemento es el último hijo dentro del
 * contenedor `<Card />` (es decir, la tarjeta no tiene Footer abajo), le añade automáticamente un padding inferior 
 * de 6 unidades para mantener la consistencia del diseño.
 */
function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

/**
 * SUBCOMPONENTE: CardFooter (Pie de Tarjeta)
 * Propósito: Espacio destinado a botones de confirmación, paginadores o fechas de creación.
 * - flex items-center: Alineación horizontal por defecto para botones en fila.
 * - [.border-t]:pt-6: Si el desarrollador inyecta un borde superior decorativo ("border-t"), el layout añade 
 * automáticamente un padding-top para distanciar el separador del contenido interno.
 */
function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center px-6 pb-6 [.border-t]:pt-6",
        className
      )}
      {...props}
    />
  );
}

// Exportación ordenada de todos los subcomponentes estructurales para el patrón de componentes compuestos.
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};