import { createClient } from "@/lib/supabase/server";

// Una "oferta" es un plan de estudios que se dicta en una regional.
export type Oferta = {
  universidadId: string;
  universidadNombre: string;
  universidadSigla: string;
  regionalId: string;
  regionalNombre: string;
  regionalSigla: string;
  carreraId: string;
  carreraNombre: string;
  planId: string;
  planNombre: string;
  planVigente: boolean;
};

type FilaOferta = {
  regional_id: string;
  plan_id: string;
  regionales: {
    nombre: string;
    sigla: string;
    universidades: { id: string; nombre: string; sigla: string };
  };
  planes: {
    nombre: string;
    vigente: boolean;
    carreras: { id: string; nombre: string };
  };
};

// Trae todas las combinaciones universidad → regional → carrera → plan cargadas en la base.
export async function obtenerOfertas(): Promise<Oferta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("planes_regionales").select(`
      regional_id,
      plan_id,
      regionales ( nombre, sigla, universidades ( id, nombre, sigla ) ),
      planes ( nombre, vigente, carreras ( id, nombre ) )
    `);

  if (error) {
    throw new Error(`No pudimos cargar las carreras: ${error.message}`);
  }

  const filas = (data ?? []) as unknown as FilaOferta[];

  return filas.map((f) => ({
    universidadId: f.regionales.universidades.id,
    universidadNombre: f.regionales.universidades.nombre,
    universidadSigla: f.regionales.universidades.sigla,
    regionalId: f.regional_id,
    regionalNombre: f.regionales.nombre,
    regionalSigla: f.regionales.sigla,
    carreraId: f.planes.carreras.id,
    carreraNombre: f.planes.carreras.nombre,
    planId: f.plan_id,
    planNombre: f.planes.nombre,
    planVigente: f.planes.vigente,
  }));
}