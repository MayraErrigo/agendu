"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS, obtenerMaterias, type EstadoMateria } from "@/lib/datos/plan";

export type EstadoGuardado = { error?: string; ok?: boolean } | null;

const esFecha = (texto: string) => /^\d{4}-\d{2}-\d{2}$/.test(texto);

// Comprueba que haya sesión y que la materia sea del plan del alumno.
async function validarMateria(materiaId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión se cerró. Volvé a iniciar sesión." } as const;

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("plan_id, regional_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!perfil?.plan_id) return { error: "Primero elegí tu carrera." } as const;

  const materias = await obtenerMaterias(perfil.plan_id, perfil.regional_id);
  if (!materias.some((m) => m.id === materiaId)) {
    return { error: "Esa materia no pertenece a tu plan." } as const;
  }
  return { supabase, usuarioId: user.id } as const;
}

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

  // Estado, nota y fechas
  const { error: errorEstado } =
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
  if (errorEstado) return { error: "No pudimos guardar los cambios. Probá de nuevo." };

  revalidatePath("/app", "layout");
  return { ok: true };
}

// Guarda las notas importantes de una materia (condiciones, criterios, fechas clave).
// Se guardan aparte del estado, así no se pierden si la materia vuelve a "pendiente".
export async function guardarImportante(_anterior: EstadoGuardado, formulario: FormData): Promise<EstadoGuardado> {
  const materiaId = String(formulario.get("materia_id") ?? "");
  const anotaciones = String(formulario.get("anotaciones") ?? "").trim();
  if (anotaciones.length > 2000) {
    return { error: "Puede tener hasta 2000 caracteres." };
  }

  const validacion = await validarMateria(materiaId);
  if ("error" in validacion) return { error: validacion.error };
  const { supabase, usuarioId } = validacion;

  const { error } = anotaciones
    ? await supabase.from("fichas_materias").upsert(
        { usuario_id: usuarioId, materia_id: materiaId, anotaciones, actualizado_en: new Date().toISOString() },
        { onConflict: "usuario_id,materia_id" }
      )
    : await supabase.from("fichas_materias").delete().eq("usuario_id", usuarioId).eq("materia_id", materiaId);
  if (error) return { error: "No pudimos guardarlo. Probá de nuevo." };

  revalidatePath("/app", "layout");
  return { ok: true };
}