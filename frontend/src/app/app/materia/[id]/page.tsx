import { Suspense } from "react";
import Link from "next/link";
import { cargarMateria } from "@/lib/datos/materia";
import { obtenerFicha } from "@/lib/datos/ficha";
import { habilita, requisitos } from "@/lib/logica/correlativas";
import FichaMateria from "./FichaMateria";

// Pestaña Resumen: estado, nota, fechas y correlativas.
export default function ResumenPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <Resumen params={params} />
    </Suspense>
  );
}

async function Resumen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { usuarioId, estados, correlativas, indice, nombre } = await cargarMateria(id);
  const ficha = await obtenerFicha(usuarioId, id);
  const lista = requisitos(id, indice, estados);
  const habilitadas = habilita(id, correlativas);

  return (
    <>
      <FichaMateria key={`${id}-${ficha.estado}`} materiaId={id} ficha={ficha} />

      <section className="flex flex-col gap-4 rounded-3xl bg-superficie p-5 shadow-sm">
        <h2 className="font-bold">Correlativas</h2>
        {lista.length ? (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-suave">Para cursarla necesitás</span>
            <ul className="flex flex-col gap-2">
              {lista.map((r) => (
                <li key={r.materiaId} className="flex items-start gap-2.5 text-sm">
                  <Marca ok={r.cumpleParaCursar} />
                  <span className="flex-1">
                    <Link href={`/app/materia/${r.materiaId}`} className="font-medium hover:underline">
                      {nombre.get(r.materiaId) ?? r.materiaId}
                    </Link>
                    <span className="text-suave"> · {r.condicion === "aprobada" ? "aprobada" : "regular"}</span>
                  </span>
                </li>
              ))}
            </ul>
            <span className="text-xs text-suave">Para rendir el final, todas tienen que estar aprobadas.</span>
          </div>
        ) : (
          <p className="text-sm text-suave">No tiene correlativas: la podés cursar desde el principio.</p>
        )}

        {habilitadas.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-fondo pt-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-suave">Es correlativa de</span>
            <div className="flex flex-wrap gap-2">
              {habilitadas.map((h) => (
                <Link
                  key={h}
                  href={`/app/materia/${h}`}
                  className="rounded-full bg-fondo px-3 py-1.5 text-sm font-medium hover:bg-bloqueo"
                >
                  {nombre.get(h) ?? h}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function Marca({ ok }: { ok: boolean }) {
  return ok ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-acento" role="img" aria-label="Cumplida">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="mt-0.5 shrink-0 text-bloqueo-tinta" role="img" aria-label="Pendiente">
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}