"use client";

import { useActionState, useState } from "react";
import { agregarMateria } from "./acciones";

const campo =
  "h-12 rounded-2xl border border-linea bg-superficie px-4 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro";

export default function FormularioAgregar() {
  const [tipo, setTipo] = useState<"obligatoria" | "electiva">("obligatoria");
  const [resultado, agregar, guardando] = useActionState(agregarMateria, null);

  return (
    <form action={agregar} className="flex flex-col gap-5 rounded-3xl bg-superficie p-5 shadow-sm">
      <input type="hidden" name="tipo" value={tipo} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nombre" className="text-sm font-semibold">
          Nombre de la materia
        </label>
        <input id="nombre" name="nombre" type="text" required minLength={2} maxLength={120} className={campo} />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">Tipo</legend>
        <div className="grid grid-cols-2 gap-1.5">
          {(["obligatoria", "electiva"] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tipo === t}
              onClick={() => setTipo(t)}
              className={`h-11 rounded-xl text-sm font-semibold transition ${
                tipo === t ? "bg-acento text-white" : "border border-linea hover:bg-fondo"
              }`}
            >
              {t === "obligatoria" ? "Obligatoria" : "Electiva"}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nivel" className="text-sm font-semibold">
            Año
          </label>
          <select id="nivel" name="nivel" required defaultValue="" className={campo}>
            <option value="" disabled>
              Elegí
            </option>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}º año
              </option>
            ))}
          </select>
        </div>
        {tipo === "electiva" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="creditos" className="text-sm font-semibold">
              Créditos
            </label>
            <input id="creditos" name="creditos" type="number" inputMode="numeric" min={1} max={20} className={campo} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="detalle" className="text-sm font-semibold">
          Comentario <span className="font-normal text-suave">(opcional)</span>
        </label>
        <textarea
          id="detalle"
          name="detalle"
          rows={3}
          maxLength={1000}
          placeholder="Ej.: es una electiva nueva de 2026, la dicta el departamento de Sistemas."
          className="rounded-2xl border border-linea bg-superficie px-4 py-3 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro"
        />
      </div>

      {resultado?.error && (
        <p role="alert" className="rounded-xl bg-error-claro px-4 py-3 text-sm text-error">
          {resultado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={guardando}
        className="h-14 rounded-2xl bg-acento font-semibold text-white transition hover:bg-acento-hover disabled:opacity-50"
      >
        {guardando ? "Agregando…" : "Agregar a mi plan"}
      </button>
    </form>
  );
}