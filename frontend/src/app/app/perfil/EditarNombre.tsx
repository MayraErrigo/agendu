"use client";

import { useActionState } from "react";
import { guardarNombre } from "./acciones";

export default function EditarNombre({ nombre }: { nombre: string }) {
  const [resultado, guardar, guardando] = useActionState(guardarNombre, null);

  return (
    <form action={guardar} className="flex flex-col gap-2">
      <label htmlFor="nombre" className="text-sm font-semibold">
        Tu nombre
      </label>
      <div className="flex gap-2">
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          minLength={2}
          maxLength={60}
          autoComplete="given-name"
          defaultValue={nombre}
          className="h-12 min-w-0 flex-1 rounded-2xl border border-linea bg-superficie px-4 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro"
        />
        <button
          type="submit"
          disabled={guardando}
          className="h-12 shrink-0 rounded-2xl bg-acento px-5 font-semibold text-white transition hover:bg-acento-hover disabled:opacity-50"
        >
          {guardando ? "…" : "Guardar"}
        </button>
      </div>
      {resultado?.error && (
        <p role="alert" className="text-sm text-error">
          {resultado.error}
        </p>
      )}
      {resultado?.ok && !guardando && (
        <p role="status" className="text-sm text-acento-hover">
          Listo, ya te saludamos con este nombre.
        </p>
      )}
    </form>
  );
}