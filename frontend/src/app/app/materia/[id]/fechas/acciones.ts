"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validarMateria } from "@/lib/datos/sesion";
import { esTipoFecha } from "@/lib/logica/fechas";
import { mensajeDeLimite } from "@/lib/logica/limites";

export type EstadoFecha = { error?: string; ok?: boolean } | null;

const esFecha = (texto: string) => /^\d{4}-\d{2}-\d{2}$/.test(texto);
const esHora = (texto: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(texto);

// Lee y revisa el formulario de una fecha.
function leer(formulario: FormData) {
  const tipo = String(formulario.get("tipo") ?? "");
  const titulo = String(formulario.get("titulo") ?? "").trim().replace(/\s+/g, " ");
  const fecha = String(formulario.get("fecha") ?? "").trim();
  const hora = String(formulario.get("hora") ?? "").trim();

  if (!esTipoFecha(tipo)) return { error: "Elegí qué tipo de fecha es." } as const;
  if (!titulo) return { error: "Escribí qué es." } as const;
  if (titulo.length > 120) return { error: "Puede tener hasta 120 caracteres." } as const;
  if (!esFecha(fecha)) return { error: "Elegí la fecha." } as const;
  if (hora && !esHora(hora)) return { error: "Revisá la hora." } as const;
  return { datos: { tipo, titulo, fecha, hora: hora || null } } as const;
}

// Crea o edita una fecha (si viene "fecha_id", la edita).
export async function guardarFecha(_anterior: EstadoFecha, formulario: FormData): Promise<EstadoFecha> {
  const materiaId = String(formulario.get("materia_id") ?? "");
  const fechaId = String(formulario.get("fecha_id") ?? "");
  const leido = leer(formulario);
  if ("error" in leido) return { error: leido.error };

  const validacion = await validarMateria(materiaId);
  if ("error" in validacion) return { error: validacion.error };
  const { supabase, usuarioId } = validacion;

  const { error } = fechaId
    ? await supabase.from("fechas").update(leido.datos).eq("id", fechaId).eq("materia_id", materiaId)
    : await supabase.from("fechas").insert({ ...leido.datos, usuario_id: usuarioId, materia_id: materiaId });
if (error) return { error: mensajeDeLimite(error.message) ?? "No pudimos guardarla. Probá de nuevo." };
  revalidatePath("/app", "layout");
  return { ok: true };
}

// Borra una fecha. La seguridad de la base (RLS) impide tocar fechas ajenas.
export async function borrarFecha(id: string): Promise<{ error?: string } | null> {
  const supabase = await createClient();
  const { error } = await supabase.from("fechas").delete().eq("id", id);
  if (error) return { error: "No pudimos borrarla. Probá de nuevo." };
  revalidatePath("/app", "layout");
  return null;
}