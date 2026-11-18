"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validarMateria } from "@/lib/datos/sesion";
import { CARPETAS_FIJAS, MAXIMO_PROPIAS, nombreRepetido } from "@/lib/logica/carpetas";

export type EstadoCarpeta = { error?: string; ok?: boolean } | null;

function leerNombre(formulario: FormData): string | { error: string } {
  const nombre = String(formulario.get("nombre") ?? "").trim().replace(/\s+/g, " ");
  if (!nombre) return { error: "Escribí un nombre." };
  if (nombre.length > 40) return { error: "El nombre puede tener hasta 40 caracteres." };
  return nombre;
}

// Las carpetas que ya existen en esa materia (fijas y propias), para no repetir nombres.
async function carpetasExistentes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  usuarioId: string,
  materiaId: string
) {
  const { data } = await supabase
    .from("carpetas")
    .select("id, nombre")
    .eq("usuario_id", usuarioId)
    .eq("materia_id", materiaId);
  const propias = (data ?? []) as { id: string; nombre: string }[];
  const todas: { id: string; nombre: string }[] = [...CARPETAS_FIJAS, ...propias];
  return { propias, todas };
}

// Crea una carpeta propia en una materia.
export async function crearCarpeta(_anterior: EstadoCarpeta, formulario: FormData): Promise<EstadoCarpeta> {
  const materiaId = String(formulario.get("materia_id") ?? "");
  const nombre = leerNombre(formulario);
  if (typeof nombre !== "string") return nombre;

  const validacion = await validarMateria(materiaId);
  if ("error" in validacion) return { error: validacion.error };
  const { supabase, usuarioId } = validacion;

  const { propias, todas } = await carpetasExistentes(supabase, usuarioId, materiaId);
  if (propias.length >= MAXIMO_PROPIAS) return { error: `Podés crear hasta ${MAXIMO_PROPIAS} carpetas por materia.` };
  if (nombreRepetido(nombre, todas)) return { error: "Ya tenés una carpeta con ese nombre." };

  const { error } = await supabase.from("carpetas").insert({ usuario_id: usuarioId, materia_id: materiaId, nombre });
  if (error) return { error: "No pudimos crearla. Probá de nuevo." };

  revalidatePath("/app", "layout");
  return { ok: true };
}

// Cambia el nombre de una carpeta propia.
export async function renombrarCarpeta(_anterior: EstadoCarpeta, formulario: FormData): Promise<EstadoCarpeta> {
  const materiaId = String(formulario.get("materia_id") ?? "");
  const carpetaId = String(formulario.get("carpeta_id") ?? "");
  const nombre = leerNombre(formulario);
  if (typeof nombre !== "string") return nombre;

  const validacion = await validarMateria(materiaId);
  if ("error" in validacion) return { error: validacion.error };
  const { supabase, usuarioId } = validacion;

  const { todas } = await carpetasExistentes(supabase, usuarioId, materiaId);
  if (nombreRepetido(nombre, todas, carpetaId)) return { error: "Ya tenés una carpeta con ese nombre." };

  const { error } = await supabase
    .from("carpetas")
    .update({ nombre })
    .eq("id", carpetaId)
    .eq("materia_id", materiaId);
  if (error) return { error: "No pudimos cambiar el nombre. Probá de nuevo." };

  revalidatePath("/app", "layout");
  return { ok: true };
}

// Borra una carpeta propia. (En la tanda 2: antes de borrarla, sus archivos pasan a "Otros".)
export async function borrarCarpeta(materiaId: string, carpetaId: string): Promise<{ error?: string } | null> {
  const validacion = await validarMateria(materiaId);
  if ("error" in validacion) return { error: validacion.error };
  const { supabase } = validacion;

  const { error } = await supabase.from("carpetas").delete().eq("id", carpetaId).eq("materia_id", materiaId);
  if (error) return { error: "No pudimos borrarla. Probá de nuevo." };

  revalidatePath("/app", "layout");
  return null;
}