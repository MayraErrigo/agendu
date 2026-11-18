"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import IconoCarpeta from "@/components/IconoCarpeta";
import { MAXIMO_PROPIAS, type Carpeta } from "@/lib/logica/carpetas";
import { crearCarpeta, type EstadoCarpeta } from "./acciones";

// La grilla de carpetas de una materia, con el botón para crear una propia.
export default function Carpetas({
  materiaId,
  carpetas,
  cantidades,
}: {
  materiaId: string;
  carpetas: Carpeta[];
  cantidades: Record<string, number>;
}) {
  const [creando, setCreando] = useState(false);
  // Al crearla bien, se cierra el formulario.
  const [resultado, crear, guardando] = useActionState(async (anterior: EstadoCarpeta, datos: FormData) => {
    const r = await crearCarpeta(anterior, datos);
    if (r?.ok) setCreando(false);
    return r;
  }, null);

  const propias = carpetas.filter((c) => !c.fija).length;
  const puedeCrear = propias < MAXIMO_PROPIAS;

  return (
    <div className="flex flex-col gap-5">
      <ul className="grid grid-cols-3 gap-2">
        {carpetas.map((c) => {
          const cantidad = cantidades[c.id] ?? 0;
          return (
            <li key={c.id}>
              <Link
                href={`/app/materia/${materiaId}/archivos/${c.id}`}
                className="flex h-full flex-col items-center gap-1 rounded-2xl px-1 py-3 text-center transition hover:bg-superficie hover:shadow-sm"
              >
                <IconoCarpeta propia={!c.fija} />
                <span className="line-clamp-2 text-sm font-semibold leading-tight">{c.nombre}</span>
                <span className="text-xs text-suave">
                  {cantidad === 0 ? "Vacía" : cantidad === 1 ? "1 archivo" : `${cantidad} archivos`}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {creando ? (
        <form action={crear} className="flex flex-col gap-2 rounded-3xl bg-superficie p-4 shadow-sm">
          <input type="hidden" name="materia_id" value={materiaId} />
          <label htmlFor="nombre-carpeta" className="text-sm font-semibold">
            Nombre de la carpeta
          </label>
          <div className="flex gap-2">
            <input
              id="nombre-carpeta"
              name="nombre"
              type="text"
              required
              maxLength={40}
              autoFocus
              placeholder="Ej.: Unidad 3"
              className="h-11 min-w-0 flex-1 rounded-xl border border-linea bg-superficie px-3 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro"
            />
            <button
              type="submit"
              disabled={guardando}
              className="h-11 shrink-0 rounded-xl bg-acento px-4 font-semibold text-white transition hover:bg-acento-hover disabled:opacity-50"
            >
              {guardando ? "…" : "Crear"}
            </button>
          </div>
          {resultado?.error && (
            <p role="alert" className="text-sm text-error">
              {resultado.error}
            </p>
          )}
          <button
            type="button"
            onClick={() => setCreando(false)}
            className="self-start text-sm font-semibold text-suave hover:underline"
          >
            Cancelar
          </button>
        </form>
      ) : puedeCrear ? (
        <button
          type="button"
          onClick={() => setCreando(true)}
          className="flex h-12 items-center justify-center rounded-2xl border border-dashed border-suave text-sm font-semibold text-suave transition hover:border-acento hover:text-acento"
        >
          + Carpeta
        </button>
      ) : (
        <p className="text-center text-sm text-suave">
          Ya creaste {MAXIMO_PROPIAS} carpetas, el máximo por materia.
        </p>
      )}
    </div>
  );
}