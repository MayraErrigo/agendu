"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EstadoGuardado = { error?: string; ok?: boolean } | null;

// Cambia el nombre con el que la app saluda al alumno.
export async function guardarNombre(_anterior: EstadoGuardado, formulario: FormData): Promise<EstadoGuardado> {
  const nombre = String(formulario.get("nombre") ?? "").trim();
  if (nombre.length < 2 || nombre.length > 60) {
    return { error: "El nombre tiene que tener entre 2 y 60 caracteres." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión se cerró. Volvé a iniciar sesión." };

  const { error } = await supabase.from("perfiles").update({ nombre }).eq("id", user.id);
  if (error) return { error: "No pudimos guardar tu nombre. Probá de nuevo." };

  revalidatePath("/app", "layout");
  return { ok: true };
}