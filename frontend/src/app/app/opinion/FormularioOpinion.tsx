"use client";

import { useActionState, useState } from "react";
import { enviarOpinion } from "./acciones";

const CATEGORIAS = [
  { id: "me_gusta", texto: "Me gusta" },
  { id: "no_entendi", texto: "No entendí algo" },
  { id: "me_falta", texto: "Me falta algo" },
  { id: "otra", texto: "Otra cosa" },
];

const EJEMPLOS: Record<string, string> = {
  me_gusta: "Ej.: Me sirvió mucho ver qué finales puedo rendir.",
  no_entendi: "Ej.: No entendí qué significa «Disponible» en el plan.",
  me_falta: "Ej.: Me gustaría ver todas mis fechas de parciales juntas.",
  otra: "Contanos lo que quieras.",
};

export default function FormularioOpinion() {
  const [categoria, setCategoria] = useState("");
  const [resultado, enviar, enviando] = useActionState(enviarOpinion, null);

  if (resultado?.ok) {
    return (
      <section className="flex flex-col gap-2 rounded-3xl bg-acento-claro p-5">
        <h2 className="font-bold text-acento-hover">¡Gracias!</h2>
        <p className="text-sm text-acento-hover">Lo leemos todo. Tu opinión nos ayuda a mejorar Agendu.</p>
      </section>
    );
  }

  return (
    <form action={enviar} className="flex flex-col gap-5 rounded-3xl bg-superficie p-5 shadow-sm">
      <input type="hidden" name="categoria" value={categoria} />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 font-bold">¿De qué se trata?</legend>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIAS.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={categoria === c.id}
              onClick={() => setCategoria(c.id)}
              className={`h-11 rounded-xl text-sm font-semibold transition ${
                categoria === c.id ? "bg-acento text-white" : "border border-linea hover:bg-fondo"
              }`}
            >
              {c.texto}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="detalle" className="font-bold">
          Contanos
        </label>
        <textarea
          id="detalle"
          name="detalle"
          rows={6}
          required
          minLength={3}
          maxLength={1000}
          placeholder={EJEMPLOS[categoria] ?? "Elegí arriba de qué se trata y contanos."}
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
        disabled={enviando || !categoria}
        className="h-14 rounded-2xl bg-acento font-semibold text-white transition hover:bg-acento-hover disabled:opacity-50"
      >
        {enviando ? "Enviando…" : "Enviar"}
      </button>
    </form>
  );
}