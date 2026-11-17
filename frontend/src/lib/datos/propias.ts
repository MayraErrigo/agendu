import { createClient } from "@/lib/supabase/server";
import type { EstadoMateria } from "@/lib/datos/plan";

export type MateriaPropia = {
  id: string;
  nombre: string;
  nivel: number;
  tipo: "obligatoria" | "electiva";
  creditos: number | null;
  estado: EstadoMateria;
};

// Las materias que el alumno agregó a su plan porque no figuraban.
export async function obtenerPropias(usuarioId: string, planId: string): Promise<MateriaPropia[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materias_propias")
    .select("id, nombre, nivel, tipo, creditos, estado")
    .eq("usuario_id", usuarioId)
    .eq("plan_id", planId)
    .order("nivel")
    .order("creado_en");

  if (error) {
    throw new Error(`No pudimos cargar tus materias agregadas: ${error.message}`);
  }
  return (data ?? []) as MateriaPropia[];
}