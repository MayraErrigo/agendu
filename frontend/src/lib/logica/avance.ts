// Cálculo del avance de la carrera para la pantalla Inicio.
// Funciones puras: no leen la base ni la pantalla, así se pueden probar solas.

import type { Estado } from "./correlativas";

export type MateriaAvance = {
  id: string;
  tipo: "obligatoria" | "electiva" | "intermedio"; // intermedio: del título intermedio, no suma al avance
  creditos: number | null;
};

export type Avance = {
  obligatoriasTotal: number;
  obligatoriasAprobadas: number;
  porcentaje: number; // 0 a 100, sobre las obligatorias
  regulares: number;
  cursando: number;
  faltan: number; // obligatorias que todavía no aprobó
  electivasAprobadas: number;
  creditosAprobados: number;
  creditosRequeridos: number | null;
  promedio: number | null; // de las materias aprobadas que tienen nota
};

export function calcularAvance(
  materias: MateriaAvance[],
  estados: Record<string, Estado>,
  notas: Record<string, number>,
  creditosRequeridos: number | null
): Avance {
  const estadoDe = (id: string): Estado => estados[id] ?? "pendiente";
  const obligatorias = materias.filter((m) => m.tipo === "obligatoria");
  const electivas = materias.filter((m) => m.tipo === "electiva");

  const obligatoriasAprobadas = obligatorias.filter((m) => estadoDe(m.id) === "aprobada").length;
  const electivasAprobadas = electivas.filter((m) => estadoDe(m.id) === "aprobada");

  const notasDeAprobadas = materias
    .filter((m) => estadoDe(m.id) === "aprobada" && typeof notas[m.id] === "number")
    .map((m) => notas[m.id]);

  return {
    obligatoriasTotal: obligatorias.length,
    obligatoriasAprobadas,
    porcentaje: obligatorias.length ? Math.round((obligatoriasAprobadas / obligatorias.length) * 100) : 0,
    regulares: materias.filter((m) => estadoDe(m.id) === "regular").length,
    cursando: materias.filter((m) => estadoDe(m.id) === "cursando").length,
    faltan: obligatorias.length - obligatoriasAprobadas,
    electivasAprobadas: electivasAprobadas.length,
    creditosAprobados: electivasAprobadas.reduce((total, m) => total + (m.creditos ?? 0), 0),
    creditosRequeridos,
    promedio: notasDeAprobadas.length
      ? Math.round((notasDeAprobadas.reduce((a, b) => a + b, 0) / notasDeAprobadas.length) * 100) / 100
      : null,
  };
}