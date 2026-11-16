import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { nombreDelAnio, obtenerCorrelativas, obtenerEstados, obtenerMaterias } from "@/lib/datos/plan";
import {
  faltantesParaCursar,
  faltantesParaRendir,
  habilita,
  indexarCorrelativas,
  puedeRendir,
  situacion,
} from "@/lib/logica/correlativas";
import PlanCarrera, { type GrupoPlan } from "./PlanCarrera";

// Pantalla Plan: la carrera completa, año por año, con el estado de cada materia.
export default function PlanPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-10 pt-12">
      <Link href="/app" className="text-sm font-semibold text-acento hover:underline">
        ← Volver
      </Link>
      <h1 className="mt-4 text-[28px] font-bold leading-tight tracking-tight">Tu carrera</h1>
      <Suspense fallback={<p className="mt-6 text-suave">Cargando tu plan…</p>}>
        <Contenido />
      </Suspense>
    </main>
  );
}

async function Contenido() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("plan_id, regional_id, planes ( nombre )")
    .eq("id", user.id)
    .maybeSingle();
  if (!perfil?.plan_id) {
    redirect("/app/carrera");
  }
  const nombrePlan = (perfil.planes as unknown as { nombre: string } | null)?.nombre ?? "";

  const [materias, estados] = await Promise.all([
    obtenerMaterias(perfil.plan_id, perfil.regional_id),
    obtenerEstados(user.id),
  ]);
  const correlativas = await obtenerCorrelativas(materias.map((m) => m.id));
  const indice = indexarCorrelativas(correlativas);
  const nombre = new Map(materias.map((m) => [m.id, m.nombre]));

  // Todo lo que la pantalla necesita de cada materia, ya calculado.
  const detalle = materias.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    nivel: m.nivel,
    tipo: m.tipo,
    creditos: m.creditos,
    seDicta: m.se_dicta,
    estado: estados[m.id] ?? "pendiente",
    situacion: situacion(m.id, indice, estados),
    puedeRendir: puedeRendir(m.id, indice, estados),
    faltanParaCursar: faltantesParaCursar(m.id, indice, estados).map((f) => ({
      nombre: nombre.get(f.materiaId) ?? f.materiaId,
      necesita: f.necesita,
    })),
    faltanParaRendir: faltantesParaRendir(m.id, indice, estados).map((f) => nombre.get(f.materiaId) ?? f.materiaId),
    habilita: habilita(m.id, correlativas).map((id) => nombre.get(id) ?? id),
  }));

  const obligatorias = detalle.filter((m) => m.tipo === "obligatoria");
  const electivas = detalle.filter((m) => m.tipo === "electiva");
  const niveles = [...new Set(obligatorias.map((m) => m.nivel))];

  const grupos: GrupoPlan[] = niveles.map((nivel) => ({
    clave: `nivel-${nivel}`,
    etiqueta: `${nivel}º`,
    titulo: nombreDelAnio(nivel),
    materias: obligatorias.filter((m) => m.nivel === nivel),
  }));
  if (electivas.length) {
    grupos.push({ clave: "electivas", etiqueta: "Elect.", titulo: "Electivas", materias: electivas });
  }

  return <PlanCarrera grupos={grupos} subtitulo={`${nombrePlan} · ${obligatorias.length} obligatorias`} />;
}