"use client";

import { useActionState } from "react";
import { pedirArrepentimiento } from "./acciones";

const campo =
  "h-12 rounded-2xl border border-linea bg-superficie px-4 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro";

export default function FormularioArrepentimiento() {
  const [resultado, enviar, enviando] = useActionState(pedirArrepentimiento, null);

  if (resultado && "codigo" in resultado) {
    return (
      <div role="status" className="flex flex-col gap-2 rounded-3xl bg-acento-claro p-5 text-acento-hover">
        <span className="font-bold">Recibimos tu pedido.</span>
        <span>
          Tu código de trámite es <strong className="font-mono text-lg">{resultado.codigo}</strong>. Guardalo: te lo
          vamos a pedir si nos escribís.
        </span>
        <span className="text-sm">
          Vamos a cancelar tu suscripción y devolverte lo que pagaste. Te escribimos al mail que dejaste.
        </span>
      </div>
    );
  }

  return (
    <form action={enviar} className="flex flex-col gap-4 rounded-3xl bg-superficie p-5 shadow-sm">
      {/* Campo trampa para robots: oculto para las personas */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="sitio">No completar</label>
        <input id="sitio" name="sitio" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold">
          Mail con el que te suscribiste
        </label>
        <input id="email" name="email" type="email" required maxLength={200} autoComplete="email" className={campo} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="motivo" className="text-sm font-semibold">
          Motivo <span className="font-normal text-suave">(opcional)</span>
        </label>
        <textarea
          id="motivo"
          name="motivo"
          rows={3}
          maxLength={1000}
          className="rounded-2xl border border-linea bg-superficie px-4 py-3 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro"
        />
      </div>

      {resultado && "error" in resultado && (
        <p role="alert" className="rounded-xl bg-error-claro px-4 py-3 text-sm text-error">
          {resultado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="h-14 rounded-2xl bg-acento font-semibold text-white transition hover:bg-acento-hover disabled:opacity-50"
      >
        {enviando ? "Enviando…" : "Pedir la cancelación"}
      </button>
    </form>
  );
}