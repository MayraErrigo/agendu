import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenerCorrelativas, obtenerEstados, obtenerMaterias, obtenerNotas } from "@/lib/datos/plan";
import { obtenerPropias } from "@/lib/datos/propias";
import { obtenerCalendario } from "@/lib/datos/calendario";
import { obtenerConexion } from "@/lib/datos/conexion";
import { hoyEnArgentina } from "@/lib/logica/fechas";
import Calendario from "@/components/calendario/Calendario";
import TarjetaPps from "@/components/TarjetaPps";
import { faltantesParaCursar, indexarCorrelativas, resumen } from "@/lib/logica/correlativas";
import { calcularAvance } from "@/lib/logica/avance";
import { cantidad, nombreUnidad, numero, unidadDe } from "@/lib/logica/unidades";
import { buscarProyectoFinal, estadoPpsDe } from "@/lib/logica/pps";

// Pantalla Inicio: el resumen de la carrera del alumno.
export default function InicioPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-12">
      <Suspense fallback={<p className="text-suave">Cargando tu carrera…</p>}>
        <Inicio />
      </Suspense>
    </main>
  );
}

type Perfil = {
  nombre: string | null;
  plan_id: string | null;
  regional_id: string | null;
  pps_estado: string | null;
  regionales: { sigla: string } | null;
  planes: {
    nombre: string;
    creditos_electivas: number | null;
    unidad_electivas: string | null;
    pps_horas: number | null;
    pps_requisitos_pf: boolean | null;
    carreras: { nombre: string };
  } | null;
};

async function Inicio() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("perfiles")
    .select(
      "nombre, plan_id, regional_id, pps_estado, regionales ( sigla ), planes ( nombre, creditos_electivas, unidad_electivas, pps_horas, pps_requisitos_pf, carreras ( nombre ) )"
    )
    .eq("id", user.id)
    .maybeSingle();
  const perfil = data as unknown as Perfil | null;
  if (!perfil?.plan_id) {
    redirect("/app/carrera");
  }

  const [materias, estados, notas, propias, calendario, conexion] = await Promise.all([
    obtenerMaterias(perfil.plan_id, perfil.regional_id),
    obtenerEstados(user.id),
    obtenerNotas(user.id),
    obtenerPropias(user.id, perfil.plan_id),
    obtenerCalendario(user.id),
    obtenerConexion(user.id),
  ]);
  const correlativas = await obtenerCorrelativas(materias.map((m) => m.id));

  // El avance cuenta también las materias que agregó el alumno (suman al total y a los créditos).
  const estadosPropias = Object.fromEntries(propias.map((p) => [p.id, p.estado]));
  const avance = calcularAvance(
    [...materias, ...propias],
    { ...estados, ...estadosPropias },
    notas,
    perfil.planes?.creditos_electivas ?? null
  );
  const { podesCursar, podesRendir } = resumen(
    materias.map((m) => m.id),
    correlativas,
    estados
  );
  const materiaPorId = new Map(materias.map((m) => [m.id, m]));
  const cursables = podesCursar.map((id) => materiaPorId.get(id)!);
  const obligatoriasCursables = cursables.filter((m) => m.tipo === "obligatoria");
  const electivasCursables = cursables.filter((m) => m.tipo === "electiva");
  const rendibles = podesRendir.map((id) => materiaPorId.get(id)!);

  // Práctica Profesional Supervisada, si el plan la pide como requisito (no como materia):
  // se empieza con los mismos requisitos que para cursar Proyecto Final.
  // Si el plan no dice sus requisitos (pps_requisitos_pf = false), no se calcula qué falta.
  const ppsHoras = perfil.planes?.pps_horas ?? null;
  const proyectoFinal = ppsHoras && perfil.planes?.pps_requisitos_pf !== false ? buscarProyectoFinal(materias) : null;
  const faltanPps = proyectoFinal
    ? faltantesParaCursar(proyectoFinal.id, indexarCorrelativas(correlativas), estados).map((f) => ({
        nombre: materiaPorId.get(f.materiaId)?.nombre ?? f.materiaId,
        necesita: f.necesita,
      }))
    : null;

  const nombre = perfil.nombre?.split(" ")[0] ?? "";
  const carrera = perfil.planes?.carreras.nombre ?? "";
  const sigla = perfil.regionales?.sigla ?? "";

  // Anillo de avance
  const radio = 44;
  const circunferencia = 2 * Math.PI * radio;
  const trazo = (circunferencia * avance.porcentaje) / 100;

  // Créditos u horas de electivas, según cómo las cuente el plan.
  const unidad = unidadDe(perfil.planes?.unidad_electivas);
  const requeridos = avance.creditosRequeridos;
  const porcentajeCreditos = requeridos ? Math.min(100, Math.round((avance.creditosAprobados / requeridos) * 100)) : 0;

  return (
    <div className="flex flex-1 flex-col gap-5">
      <header className="flex flex-col gap-0.5">
        <span className="text-sm text-suave">
          {carrera} · UTN {sigla}
        </span>
        <h1 className="text-[26px] font-bold tracking-tight">{nombre ? `Hola, ${nombre}` : "Hola"}</h1>
      </header>

      {/* Calendario: fechas importantes y parciales de todas las materias */}
      <Calendario items={calendario} hoy={hoyEnArgentina()} conexion={conexion} />

      {/* Avance */}
      <section className="flex items-center gap-5 rounded-3xl bg-superficie p-5 shadow-sm">
        <div className="relative size-26 shrink-0">
          <svg viewBox="0 0 104 104" className="size-26" role="img" aria-label={`Avance de la carrera: ${avance.porcentaje}%`}>
            <circle cx="52" cy="52" r={radio} fill="none" strokeWidth="10" className="stroke-acento-claro" />
            <circle
              cx="52"
              cy="52"
              r={radio}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${trazo} ${circunferencia}`}
              transform="rotate(-90 52 52)"
              className="stroke-acento"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold tracking-tight">
            {avance.porcentaje}%
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <span className="font-bold leading-snug">
            {avance.obligatoriasAprobadas} de {avance.obligatoriasTotal} materias aprobadas
          </span>
          <div className="flex gap-4">
            <Dato valor={avance.promedio !== null ? avance.promedio.toLocaleString("es-AR") : "—"} etiqueta="Promedio" />
            <Dato valor={String(avance.regulares)} etiqueta="Regulares" />
            <Dato valor={String(avance.faltan)} etiqueta="Te faltan" />
          </div>
        </div>
      </section>

      {/* Créditos (u horas) de electivas */}
      {requeridos && (
        <section className="flex flex-col gap-2 rounded-3xl bg-superficie p-5 shadow-sm">
          <div className="flex items-baseline justify-between">
            <h2 className="font-bold">Electivas</h2>
            <span className="text-sm text-suave">
              {numero(avance.creditosAprobados)} de {cantidad(requeridos, unidad)}
            </span>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-full bg-acento-claro"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={requeridos}
            aria-valuenow={avance.creditosAprobados}
            aria-label={`${nombreUnidad(unidad)} de electivas`}
          >
            <div className="h-full rounded-full bg-acento" style={{ width: `${porcentajeCreditos}%` }} />
          </div>
          <span className="text-xs text-suave">
            {avance.creditosAprobados >= requeridos
              ? unidad === "horas"
                ? "Ya juntaste todas las horas de electivas."
                : "Ya juntaste todos los créditos de electivas."
              : `Te faltan ${cantidad(requeridos - avance.creditosAprobados, unidad)}.`}
          </span>
        </section>
      )}

      {/* Práctica Profesional Supervisada (requisito para recibirse) */}
      {ppsHoras && <TarjetaPps horas={ppsHoras} estado={estadoPpsDe(perfil.pps_estado)} faltan={faltanPps} />}

      {/* Podés rendir */}
      {rendibles.length > 0 && (
        <section className="flex flex-col gap-2 rounded-3xl bg-arena p-5">
          <h2 className="font-bold text-arena-tinta">
            {rendibles.length === 1 ? "Podés rendir 1 final" : `Podés rendir ${rendibles.length} finales`}
          </h2>
          <ul className="flex flex-col gap-1 text-sm text-arena-tinta">
            {rendibles.map((m) => (
              <li key={m.id}>{m.nombre}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Podés cursar */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Podés cursar</h2>
          <Link href="/app/plan" className="text-sm font-semibold text-acento hover:underline">
            Ver plan
          </Link>
        </div>
        {obligatoriasCursables.length ? (
          <div className="flex flex-wrap gap-2">
            {obligatoriasCursables.map((m) => (
              <span key={m.id} className="rounded-full border border-linea bg-superficie px-3.5 py-2 text-sm font-medium">
                {m.nombre}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-suave">No tenés materias obligatorias habilitadas para cursar.</p>
        )}
        {electivasCursables.length > 0 && (
          <p className="text-sm text-suave">
            También {electivasCursables.length === 1 ? "1 electiva" : `${electivasCursables.length} electivas`}.
          </p>
        )}
      </section>

      {avance.promedio === null && avance.obligatoriasAprobadas > 0 && (
        <p className="rounded-2xl bg-pizarra px-4 py-3 text-sm text-pizarra-tinta">
          Para ver tu promedio, cargá la nota de tus materias aprobadas. Lo vas a poder hacer desde la ficha de cada
          materia.
        </p>
      )}

    </div>
  );
}

function Dato({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xl font-bold tabular-nums">{valor}</span>
      <span className="text-xs text-suave">{etiqueta}</span>
    </div>
  );
}