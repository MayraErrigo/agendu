import { createClient } from "@/lib/supabase/server";
import type { ConfigParciales, Evaluacion } from "@/lib/logica/parciales";

export const VACIA: Evaluacion = { fecha: null, nota: null, recuperatorio: null };

// Lo que el alumno cargó de los parciales de una materia. Si todavía no cargó nada, 2 parciales vacíos.
export async function obtenerParciales(usuarioId: string, materiaId: string): Promise<ConfigParciales> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("parciales_materias")
    .select("cantidad, tiene_tp, minimo, promocion_practica, aprobacion_directa, evaluaciones, tp")
    .eq("usuario_id", usuarioId)
    .eq("materia_id", materiaId)
    .maybeSingle();

  if (error) {
    throw new Error(`No pudimos cargar tus parciales: ${error.message}`);
  }

  return {
    cantidad: data?.cantidad ?? 2,
    tieneTp: data?.tiene_tp ?? false,
    minimo: data?.minimo ?? null,
    practica: data?.promocion_practica ?? null,
    directa: data?.aprobacion_directa ?? null,
    parciales: (data?.evaluaciones as Evaluacion[] | undefined) ?? [],
    tp: (data?.tp as Evaluacion | null) ?? VACIA,
  };
}