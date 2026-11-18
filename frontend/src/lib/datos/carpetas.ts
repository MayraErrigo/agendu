import { createClient } from "@/lib/supabase/server";
import { CARPETAS_FIJAS, type Carpeta } from "@/lib/logica/carpetas";

// Las carpetas de una materia: primero las 5 fijas, después las que creó el alumno.
export async function obtenerCarpetas(usuarioId: string, materiaId: string): Promise<Carpeta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("carpetas")
    .select("id, nombre")
    .eq("usuario_id", usuarioId)
    .eq("materia_id", materiaId)
    .order("creado_en");

  if (error) {
    throw new Error(`No pudimos cargar tus carpetas: ${error.message}`);
  }

  return [
    ...CARPETAS_FIJAS.map((c) => ({ id: c.id, nombre: c.nombre, fija: true })),
    ...(data ?? []).map((c) => ({ id: c.id as string, nombre: c.nombre as string, fija: false })),
  ];
}