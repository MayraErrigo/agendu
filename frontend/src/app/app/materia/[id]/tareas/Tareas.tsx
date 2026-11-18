"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import type { Tarea } from "@/lib/datos/tareas";
import { borrarTarea, crearTarea, marcarTarea } from "./acciones";

const campo =
  "h-12 rounded-2xl border border-linea bg-superficie px-4 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro";

// "Hoy", "Mañana", "Vencida · 12/11" o "jue 20/11", según el día del celular del alumno.
function textoFecha(fecha: string): { texto: string; vencida: boolean; pronto: boolean } {
  const [a, m, d] = fecha.split("-").map(Number);
  const dia = new Date(a, m - 1, d);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diferencia = Math.round((dia.getTime() - hoy.getTime()) / 86_400_000);
  const corta = `${d}/${m}`;

  if (diferencia < 0) return { texto: `Vencida · ${corta}`, vencida: true, pronto: false };
  if (diferencia === 0) return { texto: "Hoy", vencida: false, pronto: true };
  if (diferencia === 1) return { texto: "Mañana", vencida: false, pronto: true };
  const semana = dia.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "");
  return { texto: `${semana} ${corta}`, vencida: false, pronto: false };
}

export default function Tareas({ materiaId, tareas }: { materiaId: string; tareas: Tarea[] }) {
  const [resultado, crear, creando] = useActionState(crearTarea, null);
  const [error, setError] = useState<string | null>(null);
  const [verHechas, setVerHechas] = useState(false);
  const [guardando, iniciar] = useTransition();
  const formulario = useRef<HTMLFormElement>(null);

  // Al agregar una tarea, el formulario queda vacío para cargar la siguiente.
  useEffect(() => {
    if (resultado?.ok) formulario.current?.reset();
  }, [resultado]);

  const pendientes = tareas.filter((t) => !t.hecha);
  const hechas = tareas.filter((t) => t.hecha);

  function accion(funcion: () => Promise<{ error: string } | null>) {
    setError(null);
    iniciar(async () => {
      const r = await funcion();
      if (r?.error) setError(r.error);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <form ref={formulario} action={crear} className="flex flex-col gap-3 rounded-3xl bg-superficie p-5 shadow-sm">
        <input type="hidden" name="materia_id" value={materiaId} />
        <label htmlFor="titulo" className="font-bold">
          Nueva tarea
        </label>
        <input
          id="titulo"
          name="titulo"
          type="text"
          required
          maxLength={200}
          placeholder="Ej.: Estudiar temas 1 y 2"
          className={campo}
        />
        <div className="flex gap-2">
          <label htmlFor="fecha" className="sr-only">
            Fecha
          </label>
          <input id="fecha" name="fecha" type="date" className={`${campo} min-w-0 flex-1`} />
          <button
            type="submit"
            disabled={creando}
            className="h-12 shrink-0 rounded-2xl bg-acento px-5 font-semibold text-white transition hover:bg-acento-hover disabled:opacity-50"
          >
            {creando ? "…" : "Agregar"}
          </button>
        </div>
        <span className="text-xs text-suave">La fecha es opcional.</span>
        {resultado?.error && (
          <p role="alert" className="text-sm text-error">
            {resultado.error}
          </p>
        )}
      </form>

      {error && (
        <p role="alert" className="rounded-xl bg-error-claro px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-suave">
          Por hacer {pendientes.length > 0 && `· ${pendientes.length}`}
        </h2>
        {pendientes.length ? (
          <ul className="flex flex-col gap-2">
            {pendientes.map((t) => (
              <FilaTarea
                key={t.id}
                tarea={t}
                deshabilitada={guardando}
                onMarcar={() => accion(() => marcarTarea(t.id, true))}
                onBorrar={() => accion(() => borrarTarea(t.id))}
              />
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl bg-superficie px-4 py-4 text-sm text-suave shadow-sm">
            No tenés tareas pendientes en esta materia.
          </p>
        )}
      </section>

      {hechas.length > 0 && (
        <section className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setVerHechas(!verHechas)}
            aria-expanded={verHechas}
            className="self-start text-sm font-semibold text-acento hover:underline"
          >
            {verHechas ? "Ocultar hechas" : `Ver hechas (${hechas.length})`}
          </button>
          {verHechas && (
            <ul className="flex flex-col gap-2">
              {hechas.map((t) => (
                <FilaTarea
                  key={t.id}
                  tarea={t}
                  deshabilitada={guardando}
                  onMarcar={() => accion(() => marcarTarea(t.id, false))}
                  onBorrar={() => accion(() => borrarTarea(t.id))}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function FilaTarea({
  tarea,
  deshabilitada,
  onMarcar,
  onBorrar,
}: {
  tarea: Tarea;
  deshabilitada: boolean;
  onMarcar: () => void;
  onBorrar: () => void;
}) {
  const fecha = tarea.fecha ? textoFecha(tarea.fecha) : null;

  return (
    <li className="flex items-center gap-3 rounded-2xl bg-superficie px-4 py-3 shadow-sm">
      <button
        type="button"
        role="checkbox"
        aria-checked={tarea.hecha}
        aria-label={tarea.hecha ? "Marcar como pendiente" : "Marcar como hecha"}
        disabled={deshabilitada}
        onClick={onMarcar}
        className={`flex size-6 shrink-0 items-center justify-center rounded-lg border-2 transition ${
          tarea.hecha ? "border-acento bg-acento text-white" : "border-linea hover:border-acento"
        }`}
      >
        {tarea.hecha && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        )}
      </button>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={`leading-snug ${tarea.hecha ? "text-suave line-through" : "font-medium"}`}>{tarea.titulo}</span>
        {fecha && !tarea.hecha && (
          // El servidor puede estar en otra zona horaria: la fecha la decide el celular del alumno.
          <span
            suppressHydrationWarning
            className={`text-xs font-semibold ${
              fecha.vencida ? "text-error" : fecha.pronto ? "text-arena-tinta" : "text-suave"
            }`}
          >
            {fecha.texto}
          </span>
        )}
      </span>
      <button
        type="button"
        aria-label="Borrar tarea"
        disabled={deshabilitada}
        onClick={onBorrar}
        className="flex size-9 shrink-0 items-center justify-center rounded-xl text-suave transition hover:bg-error-claro hover:text-error"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" />
        </svg>
      </button>
    </li>
  );
}