"use client";

import { useActionState } from "react";
import { guardarImportante } from "../acciones";

export default function Importante({ materiaId, texto }: { materiaId: string; texto: string }) {
  const [resultado, guardar, guardando] = useActionState(guardarImportante, null);

  return (
    <form action={guardar} className="flex flex-col gap-4 rounded-3xl bg-superficie p-5 shadow-sm">
      <input type="hidden" name="materia_id" value={materiaId} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="anotaciones" className="font-bold">
          Lo importante de esta materia
        </label>
        <span className="text-sm text-suave">
          Condiciones para regularizar o promocionar, criterios del profe, fechas clave. Los apuntes de clase van en
          Archivos.
        </span>
        <textarea
          id="anotaciones"
          name="anotaciones"
          rows={8}
          maxLength={2000}
          defaultValue={texto}
          placeholder={"Ej.: Promoción con 8 en cada parcial.\nRecuperatorio solo de un parcial.\nConsultas: jueves 18 h."}
          className="mt-1 rounded-2xl border border-linea bg-superficie px-4 py-3 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro"
        />
      </div>

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
        {guardando ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}