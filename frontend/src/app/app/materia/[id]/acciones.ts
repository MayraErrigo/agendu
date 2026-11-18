"use server";

import { revalidatePath } from "next/cache";
import { ESTADOS, type EstadoMateria } from "@/lib/datos/plan";
import { validarMateria } from "@/lib/datos/sesion";

export type EstadoGuardado = { error?: string; ok?: boolean } | null;

const esFecha = (texto: string) => /^\d{4}-\d{2}-\d{2}$/.test(texto);

// Guarda el resumen de una materia: estado, nota y fechas.
export async function guardarFicha(_anterior: EstadoGuardado, formulario: FormData): Promise<EstadoGuardado> {
  const materiaId = String(formulario.get("materia_id") ?? "");
  const estado = String(formulario.get("estado") ?? "") as EstadoMateria;
  const notaTexto = String(formulario.get("nota") ?? "").trim();
  const fecha = String(formulario.get("fecha") ?? "").trim();
  const fechaRegularidad = String(formulario.get("fecha_regularidad") ?? "").trim();

  if (!ESTADOS.includes(estado)) return { error: "Elegí un estado." };

  // Nota: solo para materias aprobadas, de 1 a 10.
  let nota: number | null = null;
  if (estado === "aprobada" && notaTexto) {
    nota = Number(notaTexto.replace(",", "."));
    if (!Number.isFinite(nota) || nota < 1 || nota > 10) {
      return { error: "La nota tiene que ser un número entre 1 y 10." };
    }
  }
  if ((fecha && !esFecha(fecha)) || (fechaRegularidad && !esFecha(fechaRegularidad))) {
    return { error: "Revisá las fechas." };
  }

  const validacion = await validarMateria(materiaId);
  if ("error" in validacion) return { error: validacion.error };
  const { supabase, usuarioId } = validacion;

  const { error } =
    estado === "pendiente"
      ? await supabase.from("estados_materias").delete().eq("usuario_id", usuarioId).eq("materia_id", materiaId)
      : await supabase.from("estados_materias").upsert(
          {
            usuario_id: usuarioId,
            materia_id: materiaId,
            estado,
            nota: estado === "aprobada" ? nota : null,
            fecha: estado === "aprobada" && fecha ? fecha : null,
            fecha_regularidad: estado === "regular" && fechaRegularidad ? fechaRegularidad : null,
            actualizado_en: new Date().toISOString(),
          },
          { onConflict: "usuario_id,materia_id" }
        );
  if (error) return { error: "No pudimos guardar los cambios. Probá de nuevo." };

  revalidatePath("/app", "layout");
  return { ok: true };
}

// Lee un desplegable de notas: vacío o un entero del 1 al 10.
function leerNota(valor: FormDataEntryValue | null): number | null | "mal" {
  const texto = String(valor ?? "").trim();
  if (!texto) return null;
  const n = Number(texto);
  return Number.isInteger(n) && n >= 1 && n <= 10 ? n : "mal";
}

// Guarda la pestaña Importante: cómo se aprueba la materia y las notas importantes.
export async function guardarImportante(_anterior: EstadoGuardado, formulario: FormData): Promise<EstadoGuardado> {
  const materiaId = String(formulario.get("materia_id") ?? "");
  const anotaciones = String(formulario.get("anotaciones") ?? "").trim();
  const cantidad = Number(formulario.get("cantidad"));
  const tieneTp = formulario.get("tiene_tp") === "si";
  const minimo = leerNota(formulario.get("minimo"));
  const practica = leerNota(formulario.get("promocion_practica"));
  const directa = leerNota(formulario.get("aprobacion_directa"));

  if (anotaciones.length > 2000) return { error: "Las notas pueden tener hasta 2000 caracteres." };
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 6) return { error: "Elegí entre 1 y 6 parciales." };
  if (minimo === "mal" || practica === "mal" || directa === "mal") return { error: "Revisá las notas de cómo se aprueba." };
  if (practica !== null && directa !== null && directa < practica) {
    return { error: "La aprobación directa no puede pedir menos que la promoción práctica." };
  }

  const validacion = await validarMateria(materiaId);
  if ("error" in validacion) return { error: validacion.error };
  const { supabase, usuarioId } = validacion;
  const ahora = new Date().toISOString();

  // Cómo se aprueba: va en la misma fila que las notas de los parciales, sin tocarlas.
  const { error: errorCondiciones } = await supabase.from("parciales_materias").upsert(
    {
      usuario_id: usuarioId,
      materia_id: materiaId,
      cantidad,
      tiene_tp: tieneTp,
      minimo,
      promocion_practica: practica,
      aprobacion_directa: directa,
      actualizado_en: ahora,
    },
    { onConflict: "usuario_id,materia_id" }
  );

  // Las notas importantes. Se guardan aparte del estado, así no se pierden si la materia vuelve a "pendiente".
  const { error: errorNotas } = anotaciones
    ? await supabase
        .from("fichas_materias")
        .upsert(
          { usuario_id: usuarioId, materia_id: materiaId, anotaciones, actualizado_en: ahora },
          { onConflict: "usuario_id,materia_id" }
        )
    : await supabase.from("fichas_materias").delete().eq("usuario_id", usuarioId).eq("materia_id", materiaId);

  if (errorCondiciones || errorNotas) return { error: "No pudimos guardarlo. Probá de nuevo." };

  revalidatePath("/app", "layout");
  return { ok: true };
}