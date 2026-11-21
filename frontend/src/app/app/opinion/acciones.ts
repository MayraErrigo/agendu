"use server";

import { createClient } from "@/lib/supabase/server";

export type EstadoOpinion = { error?: string; ok?: boolean } | null;

const CATEGORIAS = ["me_gusta", "no_entendi", "me_falta", "otra"];

// Guarda una opinión del alumno sobre la app.
export async function enviarOpinion(_anterior: EstadoOpinion, formulario: FormData): Promise<EstadoOpinion> {
  const categoria = String(formulario.get("categoria") ?? "");
  const detalle = String(formulario.get("detalle") ?? "").trim();
  if (!CATEGORIAS.includes(categoria)) return { error: "Elegí de qué se trata." };
  if (detalle.length < 3) return { error: "Contanos un poco más." };
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
    tipo: "opinion",
    categoria,
    detalle,
  });
  if (error) return { error: "No pudimos enviarla. Probá de nuevo." };

  return { ok: true };
}