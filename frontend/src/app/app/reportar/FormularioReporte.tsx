"use client";

import { useActionState } from "react";
import { enviarReporte } from "./acciones";

export default function FormularioReporte() {
  const [resultado, enviar, enviando] = useActionState(enviarReporte, null);

  if (resultado?.ok) {
    return (
      <section className="flex flex-col gap-2 rounded-3xl bg-acento-claro p-5">
        <h2 className="font-bold text-acento-hover">¡Gracias por avisar!</h2>
        <p className="text-sm text-acento-hover">Lo vamos a revisar y, si corresponde, lo corregimos para todos.</p>
      </section>
    );
  }

  return (
    <form action={enviar} className="flex flex-col gap-4 rounded-3xl bg-superficie p-5 shadow-sm">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="detalle" className="font-bold">
          ¿Qué está mal?
        </label>
        <textarea
          id="detalle"
          name="detalle"
          rows={6}
          required
          minLength={5}
          maxLength={1000}
          placeholder={"Ej.: Para cursar Redes de Datos también piden Sistemas Operativos aprobada.\nEj.: Green Software es de 4º año, no de 5º."}
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
        disabled={enviando}
        className="h-14 rounded-2xl bg-acento font-semibold text-white transition hover:bg-acento-hover disabled:opacity-50"
      >
        {enviando ? "Enviando…" : "Enviar"}
      </button>
    </form>
  );
}