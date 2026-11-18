"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  nombreParcial,
  notaQueCuenta,
  resumirParciales,
  type ConfigParciales,
  type Evaluacion,
  type Situacion,
} from "@/lib/logica/parciales";
import { guardarParciales } from "./acciones";

const VACIA: Evaluacion = { fecha: null, nota: null, recuperatorio: null };
const NOTAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const campo =
  "h-11 w-full rounded-xl border border-linea bg-superficie px-3 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro";

const MENSAJE: Record<Situacion, { titulo: string; clases: string }> = {
  sin_notas: { titulo: "Todavía no cargaste notas", clases: "bg-bloqueo text-bloqueo-tinta" },
  en_curso: { titulo: "Vas cargando tus notas", clases: "bg-pizarra text-pizarra-tinta" },
  completo: { titulo: "Ya tenés todas las notas", clases: "bg-pizarra text-pizarra-tinta" },
  a_recuperar: { titulo: "Tenés que recuperar", clases: "bg-error-claro text-error" },
  libre: { titulo: "Quedaste libre", clases: "bg-error-claro text-error" },
  regularizando: { titulo: "Vas regularizando", clases: "bg-arena text-arena-tinta" },
  regularizo: { titulo: "Regularizaste", clases: "bg-arena text-arena-tinta" },
  practica_en_curso: { titulo: "Vas con promoción práctica", clases: "bg-pizarra text-pizarra-tinta" },
  promocion_practica: { titulo: "¡Promoción práctica!", clases: "bg-pizarra text-pizarra-tinta" },
  directa_en_curso: { titulo: "Vas con aprobación directa", clases: "bg-acento-claro text-acento-hover" },
  aprobacion_directa: { titulo: "¡Aprobación directa!", clases: "bg-acento-claro text-acento-hover" },
};

// Lo que le queda por hacer al alumno según cómo terminó.
const CIERRE: Partial<Record<Situacion, string>> = {
  aprobacion_directa: "No rendís final. Acordate de marcar la materia como Aprobada en Resumen.",
  promocion_practica: "Te queda el final teórico. Acordate de marcar la materia como Regular en Resumen.",
  regularizo: "Te queda el final. Acordate de marcar la materia como Regular en Resumen.",
  en_curso: "Cargá en Importante cómo se aprueba la materia para saber cómo vas.",
  completo: "Cargá en Importante cómo se aprueba la materia para saber cómo vas.",
};

export default function Parciales({ materiaId, inicial }: { materiaId: string; inicial: ConfigParciales }) {
  // Cuántos parciales hay, si hay TP y las condiciones se eligen en la pestaña Importante.
  const { cantidad, tieneTp, minimo, practica, directa } = inicial;
  const [parciales, setParciales] = useState<Evaluacion[]>(
    Array.from({ length: cantidad }, (_, i) => inicial.parciales[i] ?? VACIA)
  );
  const [tp, setTp] = useState<Evaluacion>(inicial.tp);
  const [resultado, guardar, guardando] = useActionState(guardarParciales, null);

  const resumen = resumirParciales({ cantidad, tieneTp, minimo, practica, directa, parciales, tp });
  const mensaje = MENSAJE[resumen.situacion];

  function cambiarParcial(indice: number, cambios: Partial<Evaluacion>) {
    setParciales(parciales.map((p, i) => (i === indice ? { ...p, ...cambios } : p)));
  }

  const condiciones = [
    cantidad === 1 ? "1 parcial" : `${cantidad} parciales`,
    tieneTp ? "TP integrador" : null,
    minimo ? `mínimo ${minimo} en cada parcial` : null,
    practica ? `promoción práctica con ${practica}` : null,
    directa ? `aprobación directa con ${directa}` : null,
  ].filter(Boolean);

  return (
    <form action={guardar} className="flex flex-col gap-5">
      <input type="hidden" name="materia_id" value={materiaId} />
      <input type="hidden" name="datos" value={JSON.stringify({ parciales, tp })} />

      {/* Cómo se aprueba: viene de Importante */}
      <div className="flex items-start justify-between gap-3 rounded-2xl bg-superficie px-4 py-3 text-sm shadow-sm">
        <span className="text-suave">{condiciones.join(" · ")}</span>
        <Link href={`/app/materia/${materiaId}/importante`} className="shrink-0 font-semibold text-acento hover:underline">
          Cambiar
        </Link>
      </div>

      {/* Las notas */}
      <section className="flex flex-col gap-2">
        {parciales.map((p, i) => (
          <FilaEvaluacion
            key={i}
            nombre={nombreParcial(i)}
            evaluacion={p}
            minimo={minimo}
            onCambiar={(cambios) => cambiarParcial(i, cambios)}
          />
        ))}
        {tieneTp && (
          <FilaEvaluacion
            nombre="TP integrador"
            evaluacion={tp}
            minimo={minimo}
            onCambiar={(cambios) => setTp({ ...tp, ...cambios })}
          />
        )}
      </section>

      {/* Resumen */}
      <section className={`flex flex-col gap-3 rounded-3xl p-5 ${mensaje.clases}`}>
        <h2 className="text-lg font-bold">{mensaje.titulo}</h2>
        {resumen.situacion === "a_recuperar" && <p className="text-sm">{resumen.aRecuperar.join(" y ")}.</p>}
        <div className="flex gap-6">
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold tabular-nums">
              {resumen.promedio !== null ? resumen.promedio.toLocaleString("es-AR") : "—"}
            </span>
            <span className="text-xs">Promedio</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold tabular-nums">
              {resumen.cargadas} de {resumen.total}
            </span>
            <span className="text-xs">Notas cargadas</span>
          </div>
        </div>
        {CIERRE[resumen.situacion] && <p className="text-sm">{CIERRE[resumen.situacion]}</p>}
      </section>

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

// Un desplegable de notas, con la opción "—" para dejarlo vacío.
function Selector({
  etiqueta,
  valor,
  opciones,
  onCambiar,
}: {
  etiqueta: string;
  valor: number | null;
  opciones: number[];
  onCambiar: (valor: number | null) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold">{etiqueta}</span>
      <select
        value={valor ?? ""}
        onChange={(e) => onCambiar(e.target.value ? Number(e.target.value) : null)}
        className={campo}
      >
        <option value="">Sin nota</option>
            {opciones.map((n) => (
            <option key={n} value={n}>
                {n}
          </option>
        ))}
      </select>
    </label>
  );
}

// Una evaluación: fecha, nota y, si la nota no llega al mínimo, el recuperatorio.
function FilaEvaluacion({
  nombre,
  evaluacion,
  minimo,
  onCambiar,
}: {
  nombre: string;
  evaluacion: Evaluacion;
  minimo: number | null;
  onCambiar: (cambios: Partial<Evaluacion>) => void;
}) {
  const nota = notaQueCuenta(evaluacion);
  const necesitaRecuperar = evaluacion.nota !== null && minimo !== null && evaluacion.nota < minimo;
  const mostrarRecuperatorio = necesitaRecuperar || evaluacion.recuperatorio !== null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-superficie p-4 shadow-sm">
      <div className="flex items-baseline justify-between">
        <span className="font-bold">{nombre}</span>
        {nota !== null && <span className="text-sm font-semibold text-suave">Cuenta: {nota}</span>}
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-suave">Fecha</span>
          <input
            type="date"
            value={evaluacion.fecha ?? ""}
            onChange={(e) => onCambiar({ fecha: e.target.value || null })}
            className={campo}
          />
        </label>
        <div className="w-24">
          <Selector etiqueta="Nota" valor={evaluacion.nota} opciones={NOTAS} onCambiar={(v) => onCambiar({ nota: v })} />
        </div>
      </div>
      {mostrarRecuperatorio && (
        <div className="grid grid-cols-[1fr_auto] items-end gap-3 border-t border-fondo pt-3">
          <span className="pb-3 text-sm text-suave">Si rendiste el recuperatorio, cargá la nota acá.</span>
          <div className="w-24">
            <Selector
              etiqueta="Recuperatorio"
              valor={evaluacion.recuperatorio}
              opciones={NOTAS}
              onCambiar={(v) => onCambiar({ recuperatorio: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
}