"use client";

import { useActionState, useState } from "react";
import type { EstadoMateria } from "@/lib/datos/plan";
import type { Ficha } from "@/lib/datos/ficha";
import { guardarFicha } from "./acciones";

const OPCIONES: { estado: EstadoMateria; texto: string }[] = [
  { estado: "aprobada", texto: "Aprobada" },
  { estado: "regular", texto: "Regular" },
  { estado: "cursando", texto: "Cursando" },
  { estado: "pendiente", texto: "Pendiente" },
];

const campo =
  "h-12 rounded-2xl border border-linea bg-superficie px-4 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro";

export default function FichaMateria({ materiaId, ficha }: { materiaId: string; ficha: Ficha }) {
  const [estado, setEstado] = useState<EstadoMateria>(ficha.estado);
  const [resultado, guardar, guardando] = useActionState(guardarFicha, null);

  return (
    <form action={guardar} className="flex flex-col gap-5 rounded-3xl bg-superficie p-5 shadow-sm">
      <input type="hidden" name="materia_id" value={materiaId} />
      <input type="hidden" name="estado" value={estado} />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-bold">Estado</legend>
        <div className="grid grid-cols-4 gap-1.5">
          {OPCIONES.map((o) => {
            const activo = o.estado === estado;
            return (
              <button
                key={o.estado}
                type="button"
                aria-pressed={activo}
                onClick={() => setEstado(o.estado)}
                className={`h-10 rounded-xl text-xs font-semibold transition ${
                  activo ? "bg-acento text-white" : "border border-linea hover:bg-fondo"
                }`}
              >
                {o.texto}
              </button>
            );
          })}
        </div>
      </fieldset>

      {estado === "aprobada" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nota" className="text-sm font-semibold">
              Nota
            </label>
            <input
              id="nota"
              name="nota"
              type="number"
              inputMode="decimal"
              min={1}
              max={10}
              step={0.01}
              defaultValue={ficha.nota ?? ""}
              className={campo}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fecha" className="text-sm font-semibold">
              Fecha
            </label>
            <input id="fecha" name="fecha" type="date" defaultValue={ficha.fecha ?? ""} className={campo} />
          </div>
        </div>
      )}

      {estado === "regular" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fecha_regularidad" className="text-sm font-semibold">
            Fecha en que la regularizaste
          </label>
          <input
            id="fecha_regularidad"
            name="fecha_regularidad"
            type="date"
            defaultValue={ficha.fechaRegularidad ?? ""}
            className={campo}
          />
          <span className="text-xs text-suave">Nos sirve para avisarte antes de que se venza la regularidad.</span>
        </div>
      )}

      {resultado?.error && (
        <p role="alert" className="rounded-xl bg-error-claro px-4 py-3 text-sm text-error">
          {resultado.error}
        </p>
      )}
      {resultado?.ok && !guardando && (
        <p role="status" className="rounded-xl bg-acento-claro px-4 py-3 text-sm text-acento-hover">
          Guardado.
        </p>
      )}

      <button
        type="submit"
        disabled={guardando}
        className="h-14 rounded-2xl bg-acento font-semibold text-white transition hover:bg-acento-hover disabled:opacity-50"
      >
        {guardando ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}