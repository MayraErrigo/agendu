import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenerCorrelativas, obtenerEstados, obtenerMaterias } from "@/lib/datos/plan";
import { indexarCorrelativas } from "@/lib/logica/correlativas";

// Todo lo que necesitan las pestañas de una materia: el alumno, la materia,
// el resto del plan y sus correlativas. Si algo no corresponde, redirige.
// "cache" hace que, en una misma visita, el encabezado y la pestaña compartan la consulta.
export const cargarMateria = cache(async (id: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("plan_id, regional_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!perfil?.plan_id) {
    redirect("/app/carrera");
  }

  const [materias, estados] = await Promise.all([
    obtenerMaterias(perfil.plan_id, perfil.regional_id),
    obtenerEstados(user.id),
  ]);
  const materia = materias.find((m) => m.id === id);
  if (!materia) {
    notFound();
  }

  const correlativas = await obtenerCorrelativas(materias.map((m) => m.id));

  return {
    usuarioId: user.id,
    materia,
    materias,
    estados,
    correlativas,
    indice: indexarCorrelativas(correlativas),
    nombre: new Map(materias.map((m) => [m.id, m.nombre])),
  };
});