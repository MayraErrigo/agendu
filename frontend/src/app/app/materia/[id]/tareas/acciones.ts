"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validarMateria } from "@/lib/datos/sesion";
import { mensajeDeLimite } from "@/lib/logica/limites";

export type EstadoTarea = { error?: string; ok?: boolean } | null;

const esFecha = (texto: string) => /^\d{4}-\d{2}-\d{2}$/.test(texto);

// Crea una tarea en una materia.
export async function crearTarea(_anterior: EstadoTarea, formulario: FormData): Promise<EstadoTarea> {
  const materiaId = String(formulario.get("materia_id") ?? "");
  const titulo = String(formulario.get("titulo") ?? "").trim();
  const fecha = String(formulario.get("fecha") ?? "").trim();

  if (!titulo) return { error: "Escribí qué tenés que hacer." };
  if (titulo.length > 200) return { error: "Puede tener hasta 200 caracteres." };
  if (fecha && !esFecha(fecha)) return { error: "Revisá la fecha." };

  const validacion = await validarMateria(materiaId);
  if ("error" in validacion) return { error: validacion.error };
  const { supabase, usuarioId } = validacion;

  const { error } = await supabase
    .from("tareas")
    .insert({ usuario_id: usuarioId, materia_id: materiaId, titulo, fecha: fecha || null });
  if (error) return { error: mensajeDeLimite(error.message) ?? "No pudimos guardarla. Probá de nuevo." };

  revalidatePath("/app", "layout");
  return { ok: true };
}

// Marca o desmarca una tarea como hecha. La seguridad de la base (RLS) impide tocar tareas ajenas.
export async function marcarTarea(id: string, hecha: boolean): Promise<{ error: string } | null> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tareas")
    .update({ hecha, actualizado_en: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: "No pudimos guardar el cambio. Probá de nuevo." };
  revalidatePath("/app", "layout");
  return null;
}

// Borra una tarea.
export async function borrarTarea(id: string): Promise<{ error: string } | null> {
  const supabase = await createClient();
  const { error } = await supabase.from("tareas").delete().eq("id", id);
  if (error) return { error: "No pudimos borrarla. Probá de nuevo." };
  revalidatePath("/app", "layout");
  return null;
}