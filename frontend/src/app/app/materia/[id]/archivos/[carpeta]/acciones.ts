"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { validarMateria } from "@/lib/datos/sesion";
import { esCarpetaFija } from "@/lib/logica/carpetas";
import { coincideFirma, extensionDe, formatearTamano, MAXIMO_POR_VEZ, nombreSinExtension, TIPOS } from "@/lib/logica/archivos";
import { buscarRepetido, type Repetido } from "@/lib/logica/repetidos";

type Supabase = Extract<Awaited<ReturnType<typeof validarMateria>>, { supabase: unknown }>["supabase"];

export type Preparado = { ok: true; id: string; ruta: string; contentType: string } | { ok: false; error: string };

// La carpeta existe para este alumno y esta materia?
async function carpetaValida(supabase: Supabase, usuarioId: string, materiaId: string, carpeta: string) {
  if (esCarpetaFija(carpeta)) return true;
  const { data } = await supabase
    .from("carpetas")
    .select("id")
    .eq("id", carpeta)
    .eq("usuario_id", usuarioId)
    .eq("materia_id", materiaId)
    .maybeSingle();
  return Boolean(data);
}

// Límites del alumno y espacio que ya usa (los "pendiente" de la última hora también cuentan).
async function espacio(supabase: Supabase, usuarioId: string) {
  const haceUnaHora = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const [{ data: perfil }, { data: archivos }] = await Promise.all([
    supabase.from("perfiles").select("limite_bytes, max_archivo_bytes").eq("id", usuarioId).maybeSingle(),
    supabase
      .from("archivos")
      .select("tamano")
      .eq("usuario_id", usuarioId)
      .or(`estado.eq.listo,creado_en.gte."${haceUnaHora}"`),
  ]);
  return {
    usado: (archivos ?? []).reduce((total, a) => total + Number(a.tamano), 0),
    limite: Number(perfil?.limite_bytes ?? 52428800),
    maxArchivo: Number(perfil?.max_archivo_bytes ?? 10485760),
  };
}
// Antes de subir: ¿alguno de los archivos ya está en esta carpeta? (mismo nombre; y si además pesa lo mismo, es el mismo)
export async function revisarRepetidos(
  materiaId: string,
  carpeta: string,
  archivos: { nombre: string; tamano: number }[]
): Promise<{ error?: string; repetidos?: (Repetido | null)[] }> {
  if (archivos.length > MAXIMO_POR_VEZ) return { error: `Podés subir hasta ${MAXIMO_POR_VEZ} archivos por vez.` };

  const validacion = await validarMateria(materiaId);
  if ("error" in validacion) return { error: validacion.error };
  const { supabase, usuarioId } = validacion;
  if (!(await carpetaValida(supabase, usuarioId, materiaId, carpeta))) return { error: "Esa carpeta no existe." };

  const { data } = await supabase
    .from("archivos")
    .select("id, nombre, extension, tamano")
    .eq("usuario_id", usuarioId)
    .eq("materia_id", materiaId)
    .eq("carpeta", carpeta)
    .eq("estado", "listo");
  const existentes = (data ?? []).map((a) => ({
    id: a.id as string,
    nombre: a.nombre as string,
    extension: a.extension as string,
    tamano: Number(a.tamano),
  }));

  const repetidos = archivos.map((archivo) => {
    const tipo = extensionDe(String(archivo.nombre ?? ""));
    if ("error" in tipo) return null; // se va a rechazar igual por el tipo
    return buscarRepetido(nombreSinExtension(archivo.nombre), tipo.extension, Number(archivo.tamano), existentes);
  });
  return { repetidos };
}

// Paso 1 de la subida: revisa tipo, tamaño y espacio de cada archivo y lo anota como "pendiente".
// Devuelve, para cada uno, la ruta donde el navegador lo puede subir (o el motivo por el que no).
export async function prepararSubida(
  materiaId: string,
  carpeta: string,
  archivos: { nombre: string; tamano: number }[]
): Promise<{ error?: string; resultados?: Preparado[] }> {
  if (!archivos.length) return { error: "Elegí al menos un archivo." };
  if (archivos.length > MAXIMO_POR_VEZ) return { error: `Podés subir hasta ${MAXIMO_POR_VEZ} archivos por vez.` };

  const validacion = await validarMateria(materiaId);
  if ("error" in validacion) return { error: validacion.error };
  const { supabase, usuarioId } = validacion;

  if (!(await carpetaValida(supabase, usuarioId, materiaId, carpeta))) return { error: "Esa carpeta no existe." };

  // Limpieza: subidas que quedaron a medias hace más de una hora.
  const haceUnaHora = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: colgados } = await supabase
    .from("archivos")
    .select("id, ruta")
    .eq("usuario_id", usuarioId)
    .eq("estado", "pendiente")
    .lt("creado_en", haceUnaHora);
  if (colgados?.length) {
    await supabase.storage.from("archivos").remove(colgados.map((c) => c.ruta));
    await supabase.from("archivos").delete().in("id", colgados.map((c) => c.id));
  }

  const { usado, limite, maxArchivo } = await espacio(supabase, usuarioId);
  let ocupado = usado;
  const resultados: Preparado[] = [];

  for (const archivo of archivos) {
    const tipo = extensionDe(String(archivo.nombre ?? ""));
    const tamano = Number(archivo.tamano);
    if ("error" in tipo) {
      resultados.push({ ok: false, error: tipo.error });
      continue;
    }
    if (!Number.isFinite(tamano) || tamano <= 0) {
      resultados.push({ ok: false, error: "El archivo está vacío." });
      continue;
    }
    if (tamano > maxArchivo) {
      resultados.push({ ok: false, error: `Pesa ${formatearTamano(tamano)}: el máximo es ${formatearTamano(maxArchivo)}.` });
      continue;
    }
    if (ocupado + tamano > limite) {
      resultados.push({ ok: false, error: `No te alcanza el espacio: te quedan ${formatearTamano(Math.max(0, limite - ocupado))}.` });
      continue;
    }

    const ruta = `${usuarioId}/${materiaId}/${randomUUID()}.${tipo.extension}`;
    const { data: fila, error } = await supabase
      .from("archivos")
      .insert({
        usuario_id: usuarioId,
        materia_id: materiaId,
        carpeta,
        nombre: nombreSinExtension(archivo.nombre),
        extension: tipo.extension,
        tamano,
        ruta,
      })
      .select("id")
      .single();
    if (error || !fila) {
      resultados.push({ ok: false, error: "No pudimos prepararlo. Probá de nuevo." });
      continue;
    }
    ocupado += tamano;
    resultados.push({ ok: true, id: fila.id, ruta, contentType: TIPOS[tipo.extension].mime });
  }

  return { resultados };
}

// Paso 2 de la subida, cuando el navegador terminó: revisa la "huella" y el tamaño real del archivo.
// Si no coincide con lo que dice ser, lo borra.
export async function confirmarSubida(materiaId: string, id: string): Promise<{ error?: string } | null> {
  const validacion = await validarMateria(materiaId);
  if ("error" in validacion) return { error: validacion.error };
  const { supabase, usuarioId } = validacion;

  const { data: archivo } = await supabase
    .from("archivos")
    .select("id, ruta, extension, tamano")
    .eq("id", id)
    .eq("usuario_id", usuarioId)
    .eq("estado", "pendiente")
    .maybeSingle();
  if (!archivo) return { error: "No encontramos el archivo." };

  const descartar = async (motivo: string) => {
    await supabase.storage.from("archivos").remove([archivo.ruta]);
    await supabase.from("archivos").delete().eq("id", archivo.id);
    return { error: motivo };
  };

  // Leemos solo los primeros bytes del archivo subido (con un máximo de 20 segundos de espera).
  const { data: firmado } = await supabase.storage.from("archivos").createSignedUrl(archivo.ruta, 60);
  if (!firmado) return descartar("No pudimos revisar el archivo. Probá de nuevo.");
  let bytes: Uint8Array;
  try {
    const respuesta = await fetch(firmado.signedUrl, {
      headers: { Range: "bytes=0-15" },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    if (!respuesta.ok) return descartar("No pudimos revisar el archivo. Probá de nuevo.");
    bytes = new Uint8Array(await respuesta.arrayBuffer()).slice(0, 16);
  } catch {
    return descartar("La revisión del archivo tardó demasiado. Probá de nuevo.");
  }

  const extension = archivo.extension as keyof typeof TIPOS;
  if (!coincideFirma(extension, bytes)) {
    return descartar(`Este archivo no es un ${TIPOS[extension].etiqueta} de verdad, así que no lo guardamos.`);
  }

  // La base toma el tamaño real del archivo, revisa los límites y lo marca como listo.
  const { data: resultado, error } = await supabase.rpc("confirmar_archivo", { p_id: archivo.id });
  if (error) return descartar("No pudimos guardarlo. Probá de nuevo.");
  if (resultado === "muy_grande") return descartar("El archivo pesa más que el máximo permitido.");
  if (resultado === "sin_espacio") return descartar("No te alcanza el espacio.");
  if (resultado !== "ok") return descartar("No pudimos guardarlo. Probá de nuevo.");

  revalidatePath("/app", "layout");
  return null;
}

// Si la subida falló en el navegador, se borra lo anotado.
export async function cancelarSubida(materiaId: string, id: string): Promise<void> {
  const validacion = await validarMateria(materiaId);
  if ("error" in validacion) return;
  const { supabase, usuarioId } = validacion;
  const { data: archivo } = await supabase
    .from("archivos")
    .select("ruta")
    .eq("id", id)
    .eq("usuario_id", usuarioId)
    .eq("estado", "pendiente")
    .maybeSingle();
  if (!archivo) return;
  await supabase.storage.from("archivos").remove([archivo.ruta]);
  await supabase.from("archivos").delete().eq("id", id);
}

// Cambia el nombre con el que se muestra un archivo.
export async function renombrarArchivo(materiaId: string, id: string, nombre: string): Promise<{ error?: string } | null> {
  const limpio = nombre.trim().replace(/\s+/g, " ");
  if (!limpio) return { error: "Escribí un nombre." };
  if (limpio.length > 120) return { error: "El nombre puede tener hasta 120 caracteres." };

  const validacion = await validarMateria(materiaId);
  if ("error" in validacion) return { error: validacion.error };
  const { supabase } = validacion;

  const { error } = await supabase.from("archivos").update({ nombre: limpio }).eq("id", id).eq("materia_id", materiaId);
  if (error) return { error: "No pudimos cambiar el nombre. Probá de nuevo." };
  revalidatePath("/app", "layout");
  return null;
}

// Pasa un archivo a otra carpeta de la misma materia.
export async function moverArchivo(materiaId: string, id: string, carpeta: string): Promise<{ error?: string } | null> {
  const validacion = await validarMateria(materiaId);
  if ("error" in validacion) return { error: validacion.error };
  const { supabase, usuarioId } = validacion;

  if (!(await carpetaValida(supabase, usuarioId, materiaId, carpeta))) return { error: "Esa carpeta no existe." };
  const { error } = await supabase.from("archivos").update({ carpeta }).eq("id", id).eq("materia_id", materiaId);
  if (error) return { error: "No pudimos moverlo. Probá de nuevo." };
  revalidatePath("/app", "layout");
  return null;
}

// Borra un archivo para siempre (de Storage y de la lista).
export async function borrarArchivo(materiaId: string, id: string): Promise<{ error?: string } | null> {
  const validacion = await validarMateria(materiaId);
  if ("error" in validacion) return { error: validacion.error };
  const { supabase, usuarioId } = validacion;

  const { data: archivo } = await supabase
    .from("archivos")
    .select("ruta")
    .eq("id", id)
    .eq("usuario_id", usuarioId)
    .maybeSingle();
  if (!archivo) return { error: "No encontramos el archivo." };

  const { error: errorStorage } = await supabase.storage.from("archivos").remove([archivo.ruta]);
  if (errorStorage) return { error: "No pudimos borrarlo. Probá de nuevo." };
  await supabase.from("archivos").delete().eq("id", id);
  revalidatePath("/app", "layout");
  return null;
}