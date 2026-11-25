// Práctica Profesional Supervisada (PPS) cuando el plan la pide como requisito y no como materia.
// Se puede empezar con los mismos requisitos que para cursar Proyecto Final.
// Funciones puras: no leen la base ni la pantalla, así se pueden probar solas.

export type EstadoPps = "pendiente" | "haciendo" | "aprobada";
export const ESTADOS_PPS: EstadoPps[] = ["pendiente", "haciendo", "aprobada"];

// Cómo se muestra en Inicio.
// "sin_datos": el plan no dice qué hace falta para empezarla.
export type SituacionPps = "aprobada" | "haciendo" | "disponible" | "bloqueada" | "sin_datos";

// Lo que venga de la base: si no es un estado conocido, está pendiente.
export function estadoPpsDe(valor: unknown): EstadoPps {
  return ESTADOS_PPS.includes(valor as EstadoPps) ? (valor as EstadoPps) : "pendiente";
}

// La materia Proyecto Final del plan (obligatoria), para usar sus requisitos.
export function buscarProyectoFinal<T extends { id: string; nombre: string; tipo: string }>(materias: T[]): T | null {
  const sinTildes = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return materias.find((m) => m.tipo === "obligatoria" && sinTildes(m.nombre).startsWith("proyecto final")) ?? null;
}

// Lo que marcó el alumno manda; si está pendiente, depende de si le faltan requisitos.
// faltantes = null: no sabemos los requisitos de ese plan.
export function situacionPps(estado: EstadoPps, faltantes: number | null): SituacionPps {
  if (estado === "aprobada") return "aprobada";
  if (estado === "haciendo") return "haciendo";
  if (faltantes === null) return "sin_datos";
  return faltantes > 0 ? "bloqueada" : "disponible";
}