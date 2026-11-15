"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS, obtenerMaterias, type EstadoMateria } from "@/lib/datos/plan";

export type EstadoGuardado = { error: string } | null;

// Guarda el estado de todas las materias del plan del alumno.
// Las "pendientes" se borran; el resto se crea o se actualiza.
export async function guardarAvance(_estadoAnterior: EstadoGuardado, formulario: FormData): Promise<EstadoGuardado> {
  let estados: Record<string, string>;
  try {
    estados = JSON.parse(String(formulario.get("estados") ?? "{}"));
  } catch {
    return { error: "No pudimos leer tu avance. Probá de nuevo." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("plan_id, regional_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!perfil?.plan_id) {
    redirect("/app/carrera");
  }

  // Solo aceptamos materias del plan del alumno (y electivas de su regional) y estados conocidos.
  const materias = await obtenerMaterias(perfil.plan_id, perfil.regional_id);
  const materiasDelPlan = new Set(materias.map((m) => m.id));

  const aGuardar: { usuario_id: string; materia_id: string; estado: EstadoMateria; actualizado_en: string }[] = [];
  const aBorrar: string[] = [];
  const ahora = new Date().toISOString();

  for (const [materiaId, estado] of Object.entries(estados)) {
    if (!materiasDelPlan.has(materiaId) || !ESTADOS.includes(estado as EstadoMateria)) {
      return { error: "Hay una materia que no pertenece a tu plan. Recargá la página y probá de nuevo." };
    }
    if (estado === "pendiente") {
      aBorrar.push(materiaId);
    } else {
      aGuardar.push({ usuario_id: user.id, materia_id: materiaId, estado: estado as EstadoMateria, actualizado_en: ahora });
    }
  }

  if (aGuardar.length) {
    const { error } = await supabase.from("estados_materias").upsert(aGuardar, { onConflict: "usuario_id,materia_id" });
    if (error) return { error: "No pudimos guardar tu avance. Probá de nuevo." };
  }

  if (aBorrar.length) {
    const { error } = await supabase
      .from("estados_materias")
      .delete()
      .eq("usuario_id", user.id)
      .in("materia_id", aBorrar);
    if (error) return { error: "No pudimos guardar tu avance. Probá de nuevo." };
  }

  // Avisamos a Next.js que los datos cambiaron, así no muestra una versión vieja.
  revalidatePath("/app", "layout");
  redirect("/app");
}