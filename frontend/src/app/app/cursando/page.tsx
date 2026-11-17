import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { nombreDelAnio, obtenerCorrelativas, obtenerEstados, obtenerMaterias, type Materia } from "@/lib/datos/plan";
import { obtenerPropias } from "@/lib/datos/propias";
import { indexarCorrelativas, puedeRendir } from "@/lib/logica/correlativas";

// Pantalla Cursando: las materias que el alumno tiene entre manos este cuatrimestre
// y las regulares que le quedan por rendir.
export default function CursandoPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 pt-12">
      <h1 className="text-[28px] font-bold leading-tight tracking-tight">Cursando</h1>
      <Suspense fallback={<p className="text-suave">Cargando tus materias…</p>}>
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
    .select("plan_id, regional_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!perfil?.plan_id) {
    redirect("/app/carrera");
  }

  const [materias, estados, propias] = await Promise.all([
    obtenerMaterias(perfil.plan_id, perfil.regional_id),
    obtenerEstados(user.id),
    obtenerPropias(user.id, perfil.plan_id),
  ]);
  const indice = indexarCorrelativas(await obtenerCorrelativas(materias.map((m) => m.id)));

  // Las materias agregadas por el alumno no tienen página propia: se abren desde el Plan.
  const tarjetas = [
    ...materias.map((m) => ({ ...m, estado: estados[m.id], href: `/app/materia/${m.id}`, propia: false })),
    ...propias.map((p) => ({ ...p, href: "/app/plan", propia: true })),
  ];
  const cursando = tarjetas.filter((m) => m.estado === "cursando");
  const regulares = tarjetas.filter((m) => m.estado === "regular");

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-suave">Este cuatrimestre</h2>
        {cursando.length ? (
          <ul className="flex flex-col gap-2">
            {cursando.map((m) => (
              <li key={m.id}>
                <TarjetaMateria materia={m} etiqueta="Cursando" clases="bg-pizarra text-pizarra-tinta" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-start gap-2 rounded-3xl bg-superficie p-5 shadow-sm">
            <p className="text-sm text-suave">
              Todavía no marcaste ninguna materia como «Cursando». Hacelo desde el Plan, tocando cada materia.
            </p>
            <Link href="/app/plan" className="text-sm font-semibold text-acento hover:underline">
              Ir al plan
            </Link>
          </div>
        )}
      </section>

      {regulares.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-suave">Regulares: te falta el final</h2>
          <ul className="flex flex-col gap-2">
            {regulares.map((m) => {
              const rendible = m.propia || puedeRendir(m.id, indice, estados);
              return (
                <li key={m.id}>
                  <TarjetaMateria
                    materia={m}
                    etiqueta={rendible ? "Podés rendir" : "Regular"}
                    clases="bg-arena text-arena-tinta"
                  />
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}

type Tarjeta = Pick<Materia, "id" | "nombre" | "nivel" | "tipo"> & { href: string };

function TarjetaMateria({ materia, etiqueta, clases }: { materia: Tarjeta; etiqueta: string; clases: string }) {
  return (
    <Link
      href={materia.href}
      className="flex items-center gap-3 rounded-2xl bg-superficie p-4 shadow-sm transition hover:shadow-md"
    >
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="font-semibold leading-snug">{materia.nombre}</span>
        <span className="text-xs text-suave">
          {materia.tipo === "electiva" ? "Electiva" : nombreDelAnio(materia.nivel)}
        </span>
      </span>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${clases}`}>{etiqueta}</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-suave" aria-hidden="true">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </Link>
  );
}