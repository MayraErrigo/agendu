import { createClient } from "@/lib/supabase/server";
import type { Correlativa } from "@/lib/logica/correlativas";

export const ESTADOS = ["pendiente", "cursando", "regular", "aprobada"] as const;
export type EstadoMateria = (typeof ESTADOS)[number];

export type Materia = {
  id: string;
  numero: number;
  nombre: string;
  nivel: number;
  tipo: "obligatoria" | "electiva" | "intermedio";
  integradora: boolean;
  creditos: number | null;
  se_dicta: boolean;
};

// Las materias de un plan que ve un alumno: las comunes a todas las regionales
// más las electivas de su regional. Ordenadas por año y por número.
export async function obtenerMaterias(planId: string, regionalId: string | null): Promise<Materia[]> {
  const supabase = await createClient();
  const filtroRegional = regionalId ? `regional_id.is.null,regional_id.eq.${regionalId}` : "regional_id.is.null";
  const { data, error } = await supabase
    .from("materias")
    .select("id, numero, nombre, nivel, tipo, integradora, creditos, se_dicta")
    .eq("plan_id", planId)
    .or(filtroRegional)
    .order("nivel")
    .order("numero");

  if (error) {
    throw new Error(`No pudimos cargar las materias: ${error.message}`);
  }
  return (data ?? []) as Materia[];
}

// El estado de cada materia que el alumno ya cargó (las que no aparecen están pendientes).
export async function obtenerEstados(usuarioId: string): Promise<Record<string, EstadoMateria>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("estados_materias")
    .select("materia_id, estado")
    .eq("usuario_id", usuarioId);

  if (error) {
    throw new Error(`No pudimos cargar tu avance: ${error.message}`);
  }

  const estados: Record<string, EstadoMateria> = {};
  for (const fila of (data ?? []) as { materia_id: string; estado: EstadoMateria }[]) {
    estados[fila.materia_id] = fila.estado;
  }
  return estados;
}

// "1er año", "2do año"…
export function nombreDelAnio(nivel: number): string {
  const ordinales: Record<number, string> = { 1: "1er", 2: "2do", 3: "3er", 4: "4to", 5: "5to", 6: "6to" };
  return `${ordinales[nivel] ?? `${nivel}º`} año`;
}

// Las correlativas de un grupo de materias (por ejemplo, todas las que ve el alumno).
export async function obtenerCorrelativas(materiaIds: string[]): Promise<Correlativa[]> {
  if (!materiaIds.length) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("correlativas")
    .select("materia_id, requiere_id, condicion")
    .in("materia_id", materiaIds);

  if (error) {
    throw new Error(`No pudimos cargar las correlativas: ${error.message}`);
  }
  return (data ?? []) as Correlativa[];
}

// Las notas que el alumno cargó (solo las materias que tienen nota).
export async function obtenerNotas(usuarioId: string): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("estados_materias")
    .select("materia_id, nota")
    .eq("usuario_id", usuarioId)
    .not("nota", "is", null);

  if (error) {
    throw new Error(`No pudimos cargar tus notas: ${error.message}`);
  }

  const notas: Record<string, number> = {};
  for (const fila of (data ?? []) as { materia_id: string; nota: number }[]) {
    notas[fila.materia_id] = Number(fila.nota);
  }
  return notas;
}