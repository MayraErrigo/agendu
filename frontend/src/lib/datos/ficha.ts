import { createClient } from "@/lib/supabase/server";
import type { EstadoMateria } from "@/lib/datos/plan";

export type Ficha = {
  estado: EstadoMateria;
  nota: number | null;
  fecha: string | null; // fecha de aprobación (AAAA-MM-DD)
  fechaRegularidad: string | null;
  anotaciones: string;
};

// Lo que el alumno cargó de una materia: estado, nota, fechas y anotaciones.
export async function obtenerFicha(usuarioId: string, materiaId: string): Promise<Ficha> {
  const supabase = await createClient();
  const [{ data: estado }, { data: ficha }] = await Promise.all([
    supabase
      .from("estados_materias")
      .select("estado, nota, fecha, fecha_regularidad")
      .eq("usuario_id", usuarioId)
      .eq("materia_id", materiaId)
      .maybeSingle(),
    supabase
      .from("fichas_materias")
      .select("anotaciones")
      .eq("usuario_id", usuarioId)
      .eq("materia_id", materiaId)
      .maybeSingle(),
  ]);

  return {
    estado: (estado?.estado as EstadoMateria) ?? "pendiente",
    nota: estado?.nota != null ? Number(estado.nota) : null,
    fecha: estado?.fecha ?? null,
    fechaRegularidad: estado?.fecha_regularidad ?? null,
    anotaciones: ficha?.anotaciones ?? "",
  };
}