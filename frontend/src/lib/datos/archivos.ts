import { createClient } from "@/lib/supabase/server";
import { TIPOS, type Extension } from "@/lib/logica/archivos";

export type Archivo = {
  id: string;
  nombre: string;
  extension: Extension;
  tamano: number;
  carpeta: string;
  creadoEn: string;
  link: string | null; // link firmado para abrirlo o descargarlo (vale 1 hora)
};

export type Uso = { usado: number; limite: number; maxArchivo: number };

const UNA_HORA = 60 * 60;

// Cuánto espacio usó el alumno en total y cuáles son sus límites.
export async function obtenerUso(usuarioId: string): Promise<Uso> {
  const supabase = await createClient();
  const [{ data: perfil }, { data: archivos }] = await Promise.all([
    supabase.from("perfiles").select("limite_bytes, max_archivo_bytes").eq("id", usuarioId).maybeSingle(),
    supabase.from("archivos").select("tamano").eq("usuario_id", usuarioId).eq("estado", "listo"),
  ]);
  return {
    usado: (archivos ?? []).reduce((total, a) => total + Number(a.tamano), 0),
    limite: Number(perfil?.limite_bytes ?? 52428800),
    maxArchivo: Number(perfil?.max_archivo_bytes ?? 10485760),
  };
}

// Cuántos archivos hay en cada carpeta de una materia.
export async function obtenerCantidades(usuarioId: string, materiaId: string): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("archivos")
    .select("carpeta")
    .eq("usuario_id", usuarioId)
    .eq("materia_id", materiaId)
    .eq("estado", "listo");
  const cantidades: Record<string, number> = {};
  for (const fila of data ?? []) cantidades[fila.carpeta] = (cantidades[fila.carpeta] ?? 0) + 1;
  return cantidades;
}

// Los archivos de una carpeta, del más nuevo al más viejo, con su link para abrirlos.
export async function obtenerArchivos(usuarioId: string, materiaId: string, carpeta: string): Promise<Archivo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("archivos")
    .select("id, nombre, extension, tamano, carpeta, ruta, creado_en")
    .eq("usuario_id", usuarioId)
    .eq("materia_id", materiaId)
    .eq("carpeta", carpeta)
    .eq("estado", "listo")
    .order("creado_en", { ascending: false });

  if (error) {
    throw new Error(`No pudimos cargar tus archivos: ${error.message}`);
  }

  return Promise.all(
    (data ?? []).map(async (a) => {
      const extension = a.extension as Extension;
      // PDF y fotos se abren en el navegador; Word, Excel y PowerPoint se descargan con su nombre.
      const { data: firmado } = await supabase.storage
        .from("archivos")
        .createSignedUrl(a.ruta, UNA_HORA, TIPOS[extension].abrir ? undefined : { download: `${a.nombre}.${extension}` });
      return {
        id: a.id,
        nombre: a.nombre,
        extension,
        tamano: Number(a.tamano),
        carpeta: a.carpeta,
        creadoEn: a.creado_en,
        link: firmado?.signedUrl ?? null,
      };
    })
  );
}