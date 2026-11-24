// Límites de uso de Agendu: protegen la base (que es compartida por todos) de abusos.
// Los límites de cantidad los controla la base de datos (014_limites.sql); acá están los mensajes.

export const LIMITES = {
  tareas: 1000, // en total, por alumno
  fechas: 1500, // en total, por alumno
  materiasPropias: 10, // en total, por alumno
  reportesPorDia: 10, // reportes + opiniones
  busquedasPorHora: 10, // "Buscar fechas" del calendario conectado
} as const;

// Pasa el error de la base ("limite_tareas", etc.) a un mensaje claro. Si no es de límites, devuelve null.
export function mensajeDeLimite(mensaje: string | null | undefined): string | null {
  if (!mensaje) return null;
  if (mensaje.includes("limite_tareas")) {
    return `Llegaste al máximo de ${LIMITES.tareas} tareas. Borrá las que ya hiciste para agregar nuevas.`;
  }
  if (mensaje.includes("limite_fechas")) {
    return `Llegaste al máximo de ${LIMITES.fechas} fechas. Borrá las que ya pasaron para agregar nuevas.`;
  }
  if (mensaje.includes("limite_materias_propias")) {
    return `Llegaste al máximo de ${LIMITES.materiasPropias} materias agregadas. Si te falta alguna del plan, avisanos desde Reportar un error.`;
  }
  if (mensaje.includes("limite_reportes")) {
    return "Ya nos mandaste varios mensajes hoy. Probá de nuevo mañana.";
  }
  return null;
}