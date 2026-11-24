"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { obtenerEstados, obtenerMaterias } from "@/lib/datos/plan";
import { descargarCalendario } from "@/lib/datos/leerCalendario";
import { esApertura, leerIcs, sugerirMateria, sugerirTipo } from "@/lib/logica/ics";
import { esTipoFecha, hoyEnArgentina, type TipoFecha } from "@/lib/logica/fechas";
import { sumarDias } from "@/lib/logica/calendario";
import { LIMITES, mensajeDeLimite } from "@/lib/logica/limites";

export type Origen = "uv" | "google" | "apple" | "outlook";
const ORIGENES: Origen[] = ["uv", "google", "apple", "outlook"];

export type Propuesta = {
  uid: string;
  titulo: string;
  fecha: string;
  hora: string | null;
  materiaId: string | null;
  tipo: TipoFecha;
  marcada: boolean; // si viene tildada (parece de la facu)
  motivo: string | null; // por qué viene destildada
};

const DIAS_ADELANTE = 122; // unos 4 meses
const MAXIMO_PROPUESTAS = 200;

async function alumno() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("plan_id, regional_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!perfil?.plan_id) return null;
  return { supabase, usuarioId: user.id, planId: perfil.plan_id as string, regionalId: perfil.regional_id as string | null };
}

// Lee el calendario del alumno y arma la lista para revisar.
// Si viene un link nuevo, primero lo prueba y, si anda, lo guarda como su calendario conectado.
export async function buscarFechas(nuevo?: { origen: string; link: string }): Promise<{ error?: string; propuestas?: Propuesta[] }> {
  const datos = await alumno();
  if (!datos) return { error: "Tu sesión se cerró. Volvé a iniciar sesión." };
  const { supabase, usuarioId, planId, regionalId } = datos;

  // Cada búsqueda descarga un calendario de internet: como mucho 10 por hora.
  const haceUnaHora = new Date(Date.now() - 3600_000).toISOString();
  const { count: busquedas } = await supabase
    .from("uso_acciones")
    .select("*", { count: "exact", head: true })
    .eq("usuario_id", usuarioId)
    .eq("accion", "buscar_fechas")
    .gt("creado_en", haceUnaHora);
  if ((busquedas ?? 0) >= LIMITES.busquedasPorHora) {
    return { error: "Ya buscaste fechas varias veces en la última hora. Probá de nuevo más tarde." };
  }
  const { error: errorUso } = await supabase.from("uso_acciones").insert({ usuario_id: usuarioId, accion: "buscar_fechas" });
  if (errorUso) return { error: "No pudimos buscar tus fechas. Probá de nuevo." };

  let link: string;
  if (nuevo) {
    if (!ORIGENES.includes(nuevo.origen as Origen)) return { error: "Elegí de dónde es tu calendario." };
    link = String(nuevo.link ?? "");
  } else {
    const { data: conexion } = await supabase
      .from("conexiones_calendario")
      .select("url")
      .eq("usuario_id", usuarioId)
      .maybeSingle();
    if (!conexion) return { error: "Todavía no conectaste ningún calendario." };
    link = conexion.url as string;
  }

  const descarga = await descargarCalendario(link);
  if ("error" in descarga) {
    if (!nuevo) {
      await supabase.from("conexiones_calendario").update({ ultimo_error: descarga.error }).eq("usuario_id", usuarioId);
    }
    return { error: descarga.error };
  }

  // El link anda: si es nuevo, lo guardamos (reemplaza al anterior).
  const ahora = new Date().toISOString();
  const { error: errorGuardar } = nuevo
    ? await supabase
        .from("conexiones_calendario")
        .upsert(
          { usuario_id: usuarioId, origen: nuevo.origen, url: link.trim(), ultima_busqueda: ahora, ultimo_error: null },
          { onConflict: "usuario_id" }
        )
    : await supabase.from("conexiones_calendario").update({ ultima_busqueda: ahora, ultimo_error: null }).eq("usuario_id", usuarioId);
  if (errorGuardar) return { error: "No pudimos guardar tu calendario. Probá de nuevo." };

  // Lo que ya está en Agendu o el alumno descartó antes, no se vuelve a mostrar.
  const [materias, estados, { data: yaTraidas }, { data: descartadas }] = await Promise.all([
    obtenerMaterias(planId, regionalId),
    obtenerEstados(usuarioId),
    supabase.from("fechas").select("uid_externo").eq("usuario_id", usuarioId).not("uid_externo", "is", null),
    supabase.from("eventos_descartados").select("uid").eq("usuario_id", usuarioId),
  ]);
  const vistas = new Set([...(yaTraidas ?? []).map((f) => f.uid_externo as string), ...(descartadas ?? []).map((d) => d.uid as string)]);

  const hoy = hoyEnArgentina();
  const hasta = sumarDias(hoy, DIAS_ADELANTE);
  // Para sugerir, primero se busca entre las que cursás; si no aparece, en el resto del plan.
  const todas = materias.map((m) => ({ id: m.id, nombre: m.nombre }));
  const cursando = todas.filter((m) => estados[m.id] === "cursando");

  const propuestas = leerIcs(descarga.texto)
    .filter((e) => e.fecha >= hoy && e.fecha <= hasta && !vistas.has(e.uid))
    .sort((a, b) => `${a.fecha} ${a.hora ?? "99"}`.localeCompare(`${b.fecha} ${b.hora ?? "99"}`))
    .slice(0, MAXIMO_PROPUESTAS)
    .map((e): Propuesta => {
      const texto = `${e.categoria} ${e.titulo}`;
      const materiaId = sugerirMateria(texto, cursando) ?? sugerirMateria(texto, todas);
      const apertura = esApertura(e.titulo);
      return {
        uid: e.uid,
        titulo: e.titulo,
        fecha: e.fecha,
        hora: e.hora,
        materiaId,
        tipo: sugerirTipo(e.titulo),
        marcada: Boolean(materiaId) && !apertura,
        motivo: apertura ? "Es la apertura: lo que importa es el cierre" : materiaId ? null : "No parece de la facu",
      };
    });

  revalidatePath("/app", "layout");
  return { propuestas };
}

type Elegida = { uid: string; titulo: string; fecha: string; hora: string | null; materiaId: string; tipo: string };

// Guarda las fechas elegidas y recuerda las descartadas.
export async function traerFechas(elegidas: Elegida[], descartadas: string[]): Promise<{ error?: string; traidas?: number }> {
  const datos = await alumno();
  if (!datos) return { error: "Tu sesión se cerró. Volvé a iniciar sesión." };
  const { supabase, usuarioId, planId, regionalId } = datos;
  if (elegidas.length > 300 || descartadas.length > 1000) return { error: "Son demasiadas fechas de una vez." };

  const { data: conexion } = await supabase
    .from("conexiones_calendario")
    .select("origen")
    .eq("usuario_id", usuarioId)
    .maybeSingle();
  if (!conexion) return { error: "Primero conectá tu calendario." };
  const origen = conexion.origen === "uv" ? "uv" : "calendario";

  // Cada fecha se revisa antes de guardarla: materia del plan, tipo, fecha, hora y largo del texto.
  const materias = new Set((await obtenerMaterias(planId, regionalId)).map((m) => m.id));
  const filas = [];
  for (const e of elegidas) {
    const titulo = String(e.titulo ?? "").trim().slice(0, 120);
    const uid = String(e.uid ?? "").slice(0, 500);
    const hora = e.hora && /^([01]\d|2[0-3]):[0-5]\d$/.test(e.hora) ? e.hora : null;
    if (!uid || !titulo || !/^\d{4}-\d{2}-\d{2}$/.test(e.fecha) || !esTipoFecha(e.tipo)) {
      return { error: "Hay una fecha con datos inválidos. Volvé a buscar." };
    }
    if (!materias.has(e.materiaId)) return { error: `Elegí la materia de «${titulo}».` };
    filas.push({
      usuario_id: usuarioId,
      materia_id: e.materiaId,
      tipo: e.tipo,
      titulo,
      fecha: e.fecha,
      hora,
      origen,
      uid_externo: uid,
    });
  }

  if (filas.length) {
    // Antes de guardar: que no pase el máximo de fechas (la base también lo controla).
    const { count: yaTiene } = await supabase
      .from("fechas")
      .select("*", { count: "exact", head: true })
      .eq("usuario_id", usuarioId);
    if ((yaTiene ?? 0) + filas.length > LIMITES.fechas) {
      return { error: mensajeDeLimite("limite_fechas")! };
    }

    const { error } = await supabase
      .from("fechas")
      .upsert(filas, { onConflict: "usuario_id,uid_externo", ignoreDuplicates: true });
    if (error) return { error: mensajeDeLimite(error.message) ?? "No pudimos guardar las fechas. Probá de nuevo." };
  }

  const descartes = descartadas
    .map((uid) => String(uid ?? "").slice(0, 500))
    .filter(Boolean)
    .map((uid) => ({ usuario_id: usuarioId, uid }));
  if (descartes.length) {
    await supabase.from("eventos_descartados").upsert(descartes, { onConflict: "usuario_id,uid", ignoreDuplicates: true });
  }

  revalidatePath("/app", "layout");
  return { traidas: filas.length };
}

// Desconecta el calendario: borra el link guardado y la lista de descartados.
// Las fechas que ya trajo quedan en Agendu (son suyas).
export async function desconectarCalendario(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión se cerró. Volvé a iniciar sesión." };

  const { error } = await supabase.from("conexiones_calendario").delete().eq("usuario_id", user.id);
  if (error) return { error: "No pudimos desconectar tu calendario. Probá de nuevo." };
  await supabase.from("eventos_descartados").delete().eq("usuario_id", user.id);

  revalidatePath("/app", "layout");
  return {};
}