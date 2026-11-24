"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mensajeDeLimite } from "@/lib/logica/limites";

export type EstadoGuardado = { error: string } | null;

// Agrega al plan del alumno una materia que no figura y nos manda el reporte para incorporarla.
export async function agregarMateria(_anterior: EstadoGuardado, formulario: FormData): Promise<EstadoGuardado> {
  const nombre = String(formulario.get("nombre") ?? "").trim();
  const tipo = String(formulario.get("tipo") ?? "");
  const nivel = Number(formulario.get("nivel"));
  const creditosTexto = String(formulario.get("creditos") ?? "").trim();
  const detalle = String(formulario.get("detalle") ?? "").trim();

  if (nombre.length < 2 || nombre.length > 120) return { error: "Escribí el nombre de la materia." };
  if (tipo !== "obligatoria" && tipo !== "electiva") return { error: "Elegí si es obligatoria o electiva." };
  if (!Number.isInteger(nivel) || nivel < 1 || nivel > 6) return { error: "Elegí el año." };
  if (detalle.length > 1000) return { error: "El comentario puede tener hasta 1000 caracteres." };

  let creditos: number | null = null;
  if (tipo === "electiva" && creditosTexto) {
    creditos = Number(creditosTexto);
    if (!Number.isInteger(creditos) || creditos < 1 || creditos > 20) {
      return { error: "Los créditos tienen que ser un número entero entre 1 y 20." };
    }
  }

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
  if (!perfil?.plan_id) return { error: "Primero elegí tu carrera." };

  const { error } = await supabase.from("materias_propias").insert({
    usuario_id: user.id,
    plan_id: perfil.plan_id,
    nombre,
    nivel,
    tipo,
    creditos,
  });
if (error) return { error: mensajeDeLimite(error.message) ?? "No pudimos agregarla. Probá de nuevo." };
  // El reporte es para nosotros: si falla, la materia igual queda agregada.
  await supabase.from("reportes").insert({
    usuario_id: user.id,
    plan_id: perfil.plan_id,
    regional_id: perfil.regional_id,
    tipo: "falta_materia",
    materia_nombre: nombre,
    detalle: [`${tipo}, ${nivel}º año${creditos ? `, ${creditos} créditos` : ""}`, detalle].filter(Boolean).join(" · "),
  });

  revalidatePath("/app", "layout");
  redirect("/app/plan?agregada=1");
}