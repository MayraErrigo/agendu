import { createClient } from "@/lib/supabase/server";

export type Tarea = {
  id: string;
  titulo: string;
  fecha: string | null; // AAAA-MM-DD
  hecha: boolean;
};

// Las tareas del alumno en una materia: primero las que tienen fecha, de la más próxima a la más lejana.
export async function obtenerTareas(usuarioId: string, materiaId: string): Promise<Tarea[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tareas")
    .select("id, titulo, fecha, hecha")
    .eq("usuario_id", usuarioId)
    .eq("materia_id", materiaId)
    .order("fecha", { ascending: true, nullsFirst: false })
    .order("creado_en");

  if (error) {
    throw new Error(`No pudimos cargar tus tareas: ${error.message}`);
  }
  return (data ?? []) as Tarea[];
}