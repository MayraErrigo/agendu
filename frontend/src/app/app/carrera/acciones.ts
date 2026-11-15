"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstadoGuardado = { error: string } | null;

// Guarda la regional y el plan que eligió el alumno en su perfil.
export async function guardarCarrera(_estadoAnterior: EstadoGuardado, formulario: FormData): Promise<EstadoGuardado> {
  const regionalId = String(formulario.get("regional_id") ?? "");
  const planId = String(formulario.get("plan_id") ?? "");

  if (!regionalId || !planId) {
    return { error: "Elegí tu regional, tu carrera y tu plan." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Confirmamos que ese plan se dicte en esa regional.
  const { data: oferta } = await supabase
    .from("planes_regionales")
    .select("plan_id")
    .eq("plan_id", planId)
    .eq("regional_id", regionalId)
    .maybeSingle();

  if (!oferta) {
    return { error: "Ese plan no se dicta en la regional elegida. Probá de nuevo." };
  }

  const { data: actualizado, error } = await supabase
    .from("perfiles")
    .update({ regional_id: regionalId, plan_id: planId })
    .eq("id", user.id)
    .select("id");

  if (error || !actualizado?.length) {
    return { error: "No pudimos guardar tu carrera. Probá de nuevo." };
  }

  // Avisamos a Next.js que los datos cambiaron, así no muestra una versión vieja.
  revalidatePath("/app", "layout");
  redirect("/app/avance");
}
