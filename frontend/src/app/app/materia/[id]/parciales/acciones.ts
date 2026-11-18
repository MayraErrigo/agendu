"use server";

import { revalidatePath } from "next/cache";
import { validarMateria } from "@/lib/datos/sesion";
import type { Evaluacion } from "@/lib/logica/parciales";

export type EstadoGuardado = { error?: string; ok?: boolean } | null;

const esFecha = (texto: unknown) => typeof texto === "string" && /^\d{4}-\d{2}-\d{2}$/.test(texto);
const esNota = (n: unknown) => Number.isInteger(n) && (n as number) >= 1 && (n as number) <= 10;

// Deja una evaluación limpia: solo fecha y notas válidas.
function limpiar(e: Partial<Evaluacion> | undefined): Evaluacion | null {
  const fecha = e?.fecha ?? null;
  const nota = e?.nota ?? null;
  const recuperatorio = e?.recuperatorio ?? null;
  if (fecha !== null && !esFecha(fecha)) return null;
  if (nota !== null && !esNota(nota)) return null;
  if (recuperatorio !== null && !esNota(recuperatorio)) return null;
  return { fecha, nota, recuperatorio };
}

// Guarda las notas de los parciales y del TP. Cuántos son y si hay TP se eligen en Importante.
export async function guardarParciales(_anterior: EstadoGuardado, formulario: FormData): Promise<EstadoGuardado> {
  const materiaId = String(formulario.get("materia_id") ?? "");

  let datos: { parciales?: Partial<Evaluacion>[]; tp?: Partial<Evaluacion> };
  try {
    datos = JSON.parse(String(formulario.get("datos") ?? "{}"));
  } catch {
    return { error: "No pudimos leer los datos. Recargá la página." };
  }

  const validacion = await validarMateria(materiaId);
  if ("error" in validacion) return { error: validacion.error };
  const { supabase, usuarioId } = validacion;

  // Lo que el alumno eligió en Importante (si todavía no eligió nada: 2 parciales, sin TP).
  const { data: condiciones } = await supabase
    .from("parciales_materias")
    .select("cantidad, tiene_tp")
    .eq("usuario_id", usuarioId)
    .eq("materia_id", materiaId)
    .maybeSingle();
  const cantidad = condiciones?.cantidad ?? 2;
  const tieneTp = condiciones?.tiene_tp ?? false;

  const parciales: Evaluacion[] = [];
  for (let i = 0; i < cantidad; i++) {
    const e = limpiar(datos.parciales?.[i]);
    if (!e) return { error: "Revisá las notas y fechas de los parciales." };
    parciales.push(e);
  }
  const tp = tieneTp ? limpiar(datos.tp) : null;
  if (tieneTp && !tp) return { error: "Revisá la nota y la fecha del TP integrador." };

  const { error } = await supabase.from("parciales_materias").upsert(
    {
      usuario_id: usuarioId,
      materia_id: materiaId,
      evaluaciones: parciales,
      tp,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: "usuario_id,materia_id" }
  );
  if (error) return { error: "No pudimos guardar. Probá de nuevo." };

  revalidatePath("/app", "layout");
  return { ok: true };
}