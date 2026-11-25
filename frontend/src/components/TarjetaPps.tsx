"use client";

import { useState, useTransition } from "react";
import { cambiarEstadoPps } from "@/app/app/acciones";
import { situacionPps, type EstadoPps } from "@/lib/logica/pps";

const BOTONES: { estado: EstadoPps; texto: string }[] = [
  { estado: "pendiente", texto: "Pendiente" },
  { estado: "haciendo", texto: "La estoy haciendo" },
  { estado: "aprobada", texto: "Aprobada" },
];

// Práctica Profesional Supervisada: requisito para recibirse (no es materia del plan).
// Se puede empezar con los mismos requisitos que para cursar Proyecto Final.
export default function TarjetaPps({
  horas,
  estado: estadoInicial,
  faltan,
}: {
  horas: number;
  estado: EstadoPps;
  faltan: { nombre: string; necesita: "regular" | "aprobada" }[];
}) {
  const [estado, setEstado] = useState<EstadoPps>(estadoInicial);
  const [error, setError] = useState<string | null>(null);
  const [guardando, iniciar] = useTransition();
  const situacion = situacionPps(estado, faltan.length);

  function elegir(nuevo: EstadoPps) {
    const anterior = estado;
    setEstado(nuevo);
    setError(null);
    iniciar(async () => {
      const resultado = await cambiarEstadoPps(nuevo);
      if (resultado?.error) {
        setEstado(anterior);
        setError(resultado.error);
      }
    });
  }

  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-superficie p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-bold leading-snug">Práctica Profesional Supervisada</h2>
        <span className="shrink-0 text-sm text-suave">{horas} horas</span>
      </div>

      {situacion === "aprobada" && <p className="text-sm font-semibold text-acento-hover">Aprobada ✓</p>}
      {situacion === "haciendo" && <p className="text-sm text-suave">La estás haciendo.</p>}
      {situacion === "disponible" && (
        <p className="text-sm font-semibold text-acento">Ya podés empezarla: cumplís los requisitos de Proyecto Final.</p>
      )}
      {situacion === "bloqueada" && (
        <div className="flex flex-col gap-1 text-sm">
          <span>Para empezarla necesitás los mismos requisitos que para cursar Proyecto Final. Te falta:</span>
          <ul className="flex flex-col gap-0.5 text-suave">
            {faltan.map((f) => (
              <li key={f.nombre}>
                {f.nombre} <span className="font-semibold">({f.necesita})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-3 gap-1.5">
        {BOTONES.map((b) => {
          const actual = estado === b.estado;
          return (
            <button
              key={b.estado}
              type="button"
              disabled={guardando || actual}
              onClick={() => elegir(b.estado)}
              className={`h-10 rounded-xl px-1 text-xs font-semibold transition disabled:cursor-default ${
                actual ? "bg-acento text-white" : "border border-linea bg-superficie hover:bg-fondo disabled:opacity-50"
              }`}
            >
              {b.texto}
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-error-claro px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}
    </section>
  );
}