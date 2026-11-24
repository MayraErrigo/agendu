"use server";

import { createClient } from "@/lib/supabase/server";
import { mensajeDeLimite } from "@/lib/logica/limites";

export type EstadoReporte = { error?: string; ok?: boolean } | null;

// Guarda un aviso de error en el plan (una correlativa mal, un nombre, un año…).
export async function enviarReporte(_anterior: EstadoReporte, formulario: FormData): Promise<EstadoReporte> {
  const detalle = String(formulario.get("detalle") ?? "").trim();
  if (detalle.length < 5) return { error: "Contanos un poco más qué está mal." };
  if (detalle.length > 1000) return { error: "Puede tener hasta 1000 caracteres." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión se cerró. Volvé a iniciar sesión." };

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("plan_id, regional_id")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("reportes").insert({
    usuario_id: user.id,
    plan_id: perfil?.plan_id ?? null,
    regional_id: perfil?.regional_id ?? null,
    tipo: "error",
    detalle,
  });
if (error) return { error: mensajeDeLimite(error.message) ?? "No pudimos enviarlo. Probá de nuevo." };
  return { ok: true };
}