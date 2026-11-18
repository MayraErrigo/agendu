"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { borrarCarpeta, renombrarCarpeta } from "../acciones";

// Renombrar y borrar una carpeta propia.
export default function OpcionesCarpeta({
  materiaId,
  carpetaId,
  nombre,
}: {
  materiaId: string;
  carpetaId: string;
  nombre: string;
}) {
  const router = useRouter();
  const [modo, setModo] = useState<"nada" | "renombrar" | "borrar">("nada");
  const [resultado, renombrar, renombrando] = useActionState(renombrarCarpeta, null);
  const [error, setError] = useState<string | null>(null);
  const [borrando, iniciar] = useTransition();

  // Al renombrarla, se cierra el formulario.
  useEffect(() => {
    if (resultado?.ok) setModo("nada");
  }, [resultado]);

  function confirmarBorrado() {
    setError(null);
    iniciar(async () => {
      const r = await borrarCarpeta(materiaId, carpetaId);
      if (r?.error) setError(r.error);
      else router.replace(`/app/materia/${materiaId}/archivos`);
    });
  }

  if (modo === "renombrar") {
    return (
      <form action={renombrar} className="flex flex-col gap-2 rounded-2xl bg-superficie p-4 shadow-sm">
        <input type="hidden" name="materia_id" value={materiaId} />
        <input type="hidden" name="carpeta_id" value={carpetaId} />
        <label htmlFor="nuevo-nombre" className="text-sm font-semibold">
          Nuevo nombre
        </label>
        <div className="flex gap-2">
          <input
            id="nuevo-nombre"
            name="nombre"
            type="text"
            required
            maxLength={40}
            defaultValue={nombre}
            autoFocus
            className="h-11 min-w-0 flex-1 rounded-xl border border-linea bg-superficie px-3 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro"
          />
          <button
            type="submit"
            disabled={renombrando}
            className="h-11 shrink-0 rounded-xl bg-acento px-4 font-semibold text-white transition hover:bg-acento-hover disabled:opacity-50"
          >
            {renombrando ? "…" : "Guardar"}
          </button>
        </div>
        {resultado?.error && (
          <p role="alert" className="text-sm text-error">
            {resultado.error}
          </p>
        )}
        <button type="button" onClick={() => setModo("nada")} className="self-start text-sm font-semibold text-suave hover:underline">
          Cancelar
        </button>
      </form>
    );
  }

  if (modo === "borrar") {
    return (
      <div className="flex flex-col gap-3 rounded-2xl bg-error-claro p-4">
        <p className="text-sm text-error">
          <span className="font-bold">¿Borrar «{nombre}»?</span> Los archivos que tenga pasan a la carpeta Otros.
        </p>
        {error && (
          <p role="alert" className="text-sm font-semibold text-error">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={borrando}
            onClick={confirmarBorrado}
            className="h-11 flex-1 rounded-xl bg-error font-semibold text-white transition disabled:opacity-50"
          >
            {borrando ? "Borrando…" : "Sí, borrar"}
          </button>
          <button
            type="button"
            onClick={() => setModo("nada")}
            className="h-11 flex-1 rounded-xl border border-linea bg-superficie font-semibold"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 text-sm">
      <button type="button" onClick={() => setModo("renombrar")} className="font-semibold text-acento hover:underline">
        Cambiar nombre
      </button>
      <button type="button" onClick={() => setModo("borrar")} className="font-semibold text-error hover:underline">
        Borrar carpeta
      </button>
    </div>
  );
}