"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS, obtenerMaterias, type EstadoMateria } from "@/lib/datos/plan";

// Cambia el estado de UNA materia desde la pantalla Plan.
export async function cambiarEstado(materiaId: string, estado: EstadoMateria): Promise<{ error: string } | null> {
  if (!ESTADOS.includes(estado)) {
    return { error: "Ese estado no existe." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Tu sesión se cerró. Volvé a iniciar sesión." };
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("plan_id, regional_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!perfil?.plan_id) {
    return { error: "Primero elegí tu carrera." };
  }

  // La materia tiene que ser del plan del alumno (o una electiva de su regional).
  const materias = await obtenerMaterias(perfil.plan_id, perfil.regional_id);
  if (!materias.some((m) => m.id === materiaId)) {
    return { error: "Esa materia no pertenece a tu plan." };
  }

  const { error } =
    estado === "pendiente"
      ? await supabase.from("estados_materias").delete().eq("usuario_id", user.id).eq("materia_id", materiaId)
      : await supabase.from("estados_materias").upsert(
          { usuario_id: user.id, materia_id: materiaId, estado, actualizado_en: new Date().toISOString() },
          { onConflict: "usuario_id,materia_id" }
        );

  if (error) {
    return { error: "No pudimos guardar el cambio. Probá de nuevo." };
  }

  revalidatePath("/app", "layout");
  return null;
}

// Cambia el estado de una materia que agregó el alumno.
// La seguridad de la base (RLS) ya impide tocar materias de otro alumno.
export async function cambiarEstadoPropia(id: string, estado: EstadoMateria): Promise<{ error: string } | null> {
  if (!ESTADOS.includes(estado)) {
    return { error: "Ese estado no existe." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("materias_propias")
    .update({ estado, actualizado_en: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    return { error: "No pudimos guardar el cambio. Probá de nuevo." };
  }
  revalidatePath("/app", "layout");
  return null;
}

// Quita del plan una materia que agregó el alumno. El reporte que mandó sigue en pie.
export async function quitarPropia(id: string): Promise<{ error: string } | null> {
  const supabase = await createClient();
  const { error } = await supabase.from("materias_propias").delete().eq("id", id);
  if (error) {
    return { error: "No pudimos quitarla. Probá de nuevo." };
  }
  revalidatePath("/app", "layout");
  return null;
}