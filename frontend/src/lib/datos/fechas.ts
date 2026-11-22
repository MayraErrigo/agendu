import { createClient } from "@/lib/supabase/server";
import type { ItemFecha, TipoFecha } from "@/lib/logica/fechas";
import { horaCorta } from "@/lib/logica/fechas";
import { nombreParcial, type ConfigParciales } from "@/lib/logica/parciales";

// Las fechas que el alumno cargó (o importó) en una materia.
export async function obtenerFechas(usuarioId: string, materiaId: string): Promise<ItemFecha[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fechas")
    .select("id, tipo, titulo, fecha, hora, origen")
    .eq("usuario_id", usuarioId)
    .eq("materia_id", materiaId);

  if (error) {
    throw new Error(`No pudimos cargar tus fechas: ${error.message}`);
  }
  return (data ?? []).map((f) => ({
    id: f.id as string,
    tipo: f.tipo as TipoFecha,
    titulo: f.titulo as string,
    fecha: f.fecha as string,
    hora: horaCorta(f.hora as string | null),
    origen: f.origen as ItemFecha["origen"],
  }));
}

// Las fechas que salen de la pestaña Parciales: cada parcial, su recuperatorio y el TP integrador.
export function fechasDeParciales(config: ConfigParciales): ItemFecha[] {
  const items: ItemFecha[] = [];
  config.parciales.slice(0, config.cantidad).forEach((p, i) => {
    const nombre = nombreParcial(i);
    if (p.fecha) items.push({ id: `parcial-${i}`, tipo: "parcial", titulo: nombre, fecha: p.fecha, hora: null, origen: "parciales" });
    if (p.fechaRecuperatorio) {
      items.push({ id: `recu-${i}`, tipo: "parcial", titulo: `Recuperatorio del ${nombre}`, fecha: p.fechaRecuperatorio, hora: null, origen: "parciales" });
    }
  });
  if (config.tieneTp && config.tp.fecha) {
    items.push({ id: "tp", tipo: "parcial", titulo: "TP integrador", fecha: config.tp.fecha, hora: null, origen: "parciales" });
  }
  return items;
}