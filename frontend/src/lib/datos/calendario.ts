import { createClient } from "@/lib/supabase/server";
import { fechasDeParciales } from "@/lib/datos/fechas";
import { horaCorta, type ItemFecha, type TipoFecha } from "@/lib/logica/fechas";
import type { Evaluacion } from "@/lib/logica/parciales";

export type ItemCalendario = ItemFecha & { materiaId: string; materia: string };

// Todas las fechas importantes del alumno, de todas sus materias: las de la pestaña Fechas
// más los parciales, recuperatorios y TP integrador. Las tareas no van.
export async function obtenerCalendario(usuarioId: string): Promise<ItemCalendario[]> {
  const supabase = await createClient();
  const [{ data: fechas, error: errorFechas }, { data: parciales, error: errorParciales }] = await Promise.all([
    supabase
      .from("fechas")
      .select("id, tipo, titulo, fecha, hora, origen, materia_id, materias ( nombre )")
      .eq("usuario_id", usuarioId),
    supabase
      .from("parciales_materias")
      .select("materia_id, cantidad, tiene_tp, evaluaciones, tp, materias ( nombre )")
      .eq("usuario_id", usuarioId),
  ]);
  if (errorFechas || errorParciales) {
    throw new Error("No pudimos cargar tu calendario.");
  }

  const nombre = (fila: { materias: unknown }) =>
    (fila.materias as { nombre: string } | null)?.nombre ?? "Materia";

  const deFechas: ItemCalendario[] = (fechas ?? []).map((f) => ({
    id: f.id as string,
    tipo: f.tipo as TipoFecha,
    titulo: f.titulo as string,
    fecha: f.fecha as string,
    hora: horaCorta(f.hora as string | null),
    origen: f.origen as ItemFecha["origen"],
    materiaId: f.materia_id as string,
    materia: nombre(f),
  }));

  const deParciales: ItemCalendario[] = (parciales ?? []).flatMap((p) =>
    fechasDeParciales({
      cantidad: p.cantidad,
      tieneTp: p.tiene_tp,
      minimo: null,
      practica: null,
      directa: null,
      parciales: (p.evaluaciones as Evaluacion[]) ?? [],
      tp: (p.tp as Evaluacion | null) ?? { fecha: null, nota: null, recuperatorio: null },
    }).map((item) => ({
      ...item,
      id: `${p.materia_id}-${item.id}`,
      materiaId: p.materia_id as string,
      materia: nombre(p),
    }))
  );

  return [...deFechas, ...deParciales];
}