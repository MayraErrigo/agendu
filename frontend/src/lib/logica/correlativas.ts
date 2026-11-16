// Lógica de correlativas de Agendu.
// Funciones puras: no leen la base ni la pantalla, así se pueden probar solas.
//
// Reglas (régimen de la UTN):
// - Para CURSAR una materia: las correlativas "regular" tienen que estar regulares o aprobadas,
//   y las correlativas "aprobada" tienen que estar aprobadas.
// - Para RENDIR el final: la materia tiene que estar regular y TODAS sus correlativas aprobadas.

export type Estado = "pendiente" | "cursando" | "regular" | "aprobada";
export type Condicion = "regular" | "aprobada";

export type Correlativa = {
  materia_id: string;
  requiere_id: string;
  condicion: Condicion;
};

// Cómo se ve una materia según el avance del alumno.
export type Situacion = "aprobada" | "regular" | "cursando" | "disponible" | "bloqueada";

export type Faltante = {
  materiaId: string;
  necesita: Condicion; // qué estado le falta alcanzar a esa correlativa
};

type Estados = Record<string, Estado>;

const estadoDe = (estados: Estados, id: string): Estado => estados[id] ?? "pendiente";

function cumple(estado: Estado, necesita: Condicion): boolean {
  if (necesita === "aprobada") return estado === "aprobada";
  return estado === "regular" || estado === "aprobada";
}

// Agrupa las correlativas por materia para buscarlas rápido.
export function indexarCorrelativas(correlativas: Correlativa[]): Map<string, Correlativa[]> {
  const indice = new Map<string, Correlativa[]>();
  for (const c of correlativas) {
    const lista = indice.get(c.materia_id) ?? [];
    lista.push(c);
    indice.set(c.materia_id, lista);
  }
  return indice;
}

// Qué le falta para poder CURSAR la materia.
export function faltantesParaCursar(
  materiaId: string,
  indice: Map<string, Correlativa[]>,
  estados: Estados
): Faltante[] {
  return (indice.get(materiaId) ?? [])
    .filter((c) => !cumple(estadoDe(estados, c.requiere_id), c.condicion))
    .map((c) => ({ materiaId: c.requiere_id, necesita: c.condicion }));
}

// Qué le falta para poder RENDIR el final (todas las correlativas aprobadas).
export function faltantesParaRendir(
  materiaId: string,
  indice: Map<string, Correlativa[]>,
  estados: Estados
): Faltante[] {
  return (indice.get(materiaId) ?? [])
    .filter((c) => estadoDe(estados, c.requiere_id) !== "aprobada")
    .map((c) => ({ materiaId: c.requiere_id, necesita: "aprobada" as const }));
}

// Situación de una materia: aprobada, regular, cursando, disponible o bloqueada.
export function situacion(materiaId: string, indice: Map<string, Correlativa[]>, estados: Estados): Situacion {
  const estado = estadoDe(estados, materiaId);
  if (estado !== "pendiente") return estado;
  return faltantesParaCursar(materiaId, indice, estados).length === 0 ? "disponible" : "bloqueada";
}

// Puede rendir el final: está regular y tiene todas las correlativas aprobadas.
export function puedeRendir(materiaId: string, indice: Map<string, Correlativa[]>, estados: Estados): boolean {
  return estadoDe(estados, materiaId) === "regular" && faltantesParaRendir(materiaId, indice, estados).length === 0;
}

// Materias que piden a esta como correlativa (las que "habilita").
export function habilita(materiaId: string, correlativas: Correlativa[]): string[] {
  return correlativas.filter((c) => c.requiere_id === materiaId).map((c) => c.materia_id);
}

// Resumen para la pantalla Inicio.
export function resumen(materiaIds: string[], correlativas: Correlativa[], estados: Estados) {
  const indice = indexarCorrelativas(correlativas);
  return {
    podesCursar: materiaIds.filter((id) => situacion(id, indice, estados) === "disponible"),
    podesRendir: materiaIds.filter((id) => puedeRendir(id, indice, estados)),
  };
}

// Cada correlativa de una materia, con lo que pide y si el alumno ya la cumple.
export type Requisito = {
  materiaId: string;
  condicion: Condicion; // lo que pide para cursar
  cumpleParaCursar: boolean;
  aprobada: boolean; // para rendir el final hacen falta todas aprobadas
};

export function requisitos(materiaId: string, indice: Map<string, Correlativa[]>, estados: Estados): Requisito[] {
  return (indice.get(materiaId) ?? []).map((c) => {
    const estado = estadoDe(estados, c.requiere_id);
    return {
      materiaId: c.requiere_id,
      condicion: c.condicion,
      cumpleParaCursar: cumple(estado, c.condicion),
      aprobada: estado === "aprobada",
    };
  });
}