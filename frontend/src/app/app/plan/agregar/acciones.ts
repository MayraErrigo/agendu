"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mensajeDeLimite } from "@/lib/logica/limites";
import { cantidad, leerCantidad, unidadDe } from "@/lib/logica/unidades";

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

  // Créditos u horas: de 0,5 a 20, de medio en medio (por ejemplo 2 o 1,5).
  let creditos: number | null = null;
  if (tipo === "electiva" && creditosTexto) {
    creditos = leerCantidad(creditosTexto);
    if (creditos === null) {
      return { error: "Escribí un número entre 0,5 y 20, por ejemplo 2 o 1,5." };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión se cerró. Volvé a iniciar sesión." };

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("plan_id, regional_id, planes ( unidad_electivas )")
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

  const unidad = unidadDe((perfil.planes as unknown as { unidad_electivas: string | null } | null)?.unidad_electivas);

  // El reporte es para nosotros: si falla, la materia igual queda agregada.
  await supabase.from("reportes").insert({
    usuario_id: user.id,
    plan_id: perfil.plan_id,
    regional_id: perfil.regional_id,
    tipo: "falta_materia",
    materia_nombre: nombre,
    detalle: [`${tipo}, ${nivel}º año${creditos ? `, ${cantidad(creditos, unidad)}` : ""}`, detalle].filter(Boolean).join(" · "),
  });

  revalidatePath("/app", "layout");
  redirect("/app/plan?agregada=1");
}