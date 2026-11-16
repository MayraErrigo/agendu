"use client";

import { useState, useTransition } from "react";
import type { EstadoMateria } from "@/lib/datos/plan";
import type { Condicion, Situacion } from "@/lib/logica/correlativas";
import { cambiarEstado } from "./acciones";

export type MateriaPlan = {
  id: string;
  nombre: string;
  nivel: number;
  tipo: "obligatoria" | "electiva";
  creditos: number | null;
  seDicta: boolean;
  estado: EstadoMateria;
  situacion: Situacion;
  puedeRendir: boolean;
  faltanParaCursar: { nombre: string; necesita: Condicion }[];
  faltanParaRendir: string[];
  habilita: string[];
};

export type GrupoPlan = { clave: string; etiqueta: string; titulo: string; materias: MateriaPlan[] };

const ESTILO: Record<Situacion, { texto: string; insignia: string; tarjeta: string }> = {
  aprobada: { texto: "Aprobada", insignia: "bg-acento-claro text-acento-hover", tarjeta: "bg-superficie" },
  regular: { texto: "Regular", insignia: "bg-arena text-arena-tinta", tarjeta: "bg-superficie" },
  cursando: { texto: "Cursando", insignia: "bg-pizarra text-pizarra-tinta", tarjeta: "bg-superficie" },
  disponible: { texto: "Disponible", insignia: "border-2 border-acento text-acento", tarjeta: "bg-superficie" },
  bloqueada: { texto: "Bloqueada", insignia: "bg-bloqueo text-bloqueo-tinta", tarjeta: "bg-bloqueo/60" },
};

const BOTONES: { estado: EstadoMateria; texto: string }[] = [
  { estado: "aprobada", texto: "Aprobada" },
  { estado: "regular", texto: "Regular" },
  { estado: "cursando", texto: "Cursando" },
  { estado: "pendiente", texto: "Pendiente" },
];

// La línea chica debajo del nombre de cada materia.
function subtitulo(m: MateriaPlan): string {
  switch (m.situacion) {
    case "aprobada":
      return "Aprobada";
    case "regular":
      return m.puedeRendir ? "Lista para rendir el final" : "Regular · faltan correlativas para rendir";
    case "cursando":
      return "La estás cursando";
    case "disponible":
      return "Ya podés cursarla";
    case "bloqueada":
      return m.faltanParaCursar.length === 1
        ? "Te falta 1 correlativa"
        : `Te faltan ${m.faltanParaCursar.length} correlativas`;
  }
}

export default function PlanCarrera({ grupos, subtitulo: textoPlan }: { grupos: GrupoPlan[]; subtitulo: string }) {
  const [elegido, setElegido] = useState(grupos[0]?.clave ?? "");
  const [abierta, setAbierta] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, iniciar] = useTransition();

  const grupo = grupos.find((g) => g.clave === elegido) ?? grupos[0];
  if (!grupo) return null;
  const aprobadas = grupo.materias.filter((m) => m.situacion === "aprobada").length;

  function elegirEstado(materiaId: string, estado: EstadoMateria) {
    setError(null);
    iniciar(async () => {
      const resultado = await cambiarEstado(materiaId, estado);
      if (resultado?.error) setError(resultado.error);
    });
  }

  return (
    <div className="mt-2 flex flex-col gap-4">
      <p className="text-sm text-suave">{textoPlan}</p>

      <div
        role="tablist"
        aria-label="Año de la carrera"
        className="grid gap-1 rounded-2xl bg-bloqueo p-1"
        style={{ gridTemplateColumns: `repeat(${grupos.length}, minmax(0, 1fr))` }}
      >
        {grupos.map((g) => {
          const activo = g.clave === grupo.clave;
          return (
            <button
              key={g.clave}
              type="button"
              role="tab"
              aria-selected={activo}
              onClick={() => {
                setElegido(g.clave);
                setAbierta(null);
              }}
              className={`h-10 rounded-xl text-sm transition ${
                activo ? "bg-superficie font-bold text-tinta shadow-sm" : "font-semibold text-suave"
              }`}
            >
              {g.etiqueta}
            </button>
          );
        })}
      </div>

      <div className="flex items-baseline justify-between">
        <h2 className="font-bold">{grupo.titulo}</h2>
        <span className="text-sm text-suave">
          {aprobadas} de {grupo.materias.length} aprobadas
        </span>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-error-claro px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {grupo.materias.map((m) => {
          const estilo = ESTILO[m.situacion];
          const estaAbierta = abierta === m.id;
          return (
            <li key={m.id} className={`rounded-2xl ${estilo.tarjeta}`}>
              <button
                type="button"
                onClick={() => setAbierta(estaAbierta ? null : m.id)}
                aria-expanded={estaAbierta}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-semibold leading-snug">{m.nombre}</span>
                  <span className="text-xs text-suave">
                    {subtitulo(m)}
                    {m.tipo === "electiva" && m.creditos ? ` · ${m.creditos} créditos` : ""}
                    {m.tipo === "electiva" ? ` · ${m.nivel}º año` : ""}
                  </span>
                </span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${estilo.insignia}`}>
                  {estilo.texto}
                </span>
              </button>

              {estaAbierta && (
                <div className="flex flex-col gap-4 border-t border-fondo px-4 pb-4 pt-3 text-sm">
                  {m.situacion === "bloqueada" && (
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold">Para cursarla te falta:</span>
                      <ul className="flex flex-col gap-1 text-suave">
                        {m.faltanParaCursar.map((f) => (
                          <li key={f.nombre}>
                            {f.nombre} <span className="font-semibold">({f.necesita})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {m.situacion === "regular" && !m.puedeRendir && (
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold">Para rendir el final te falta aprobar:</span>
                      <ul className="flex flex-col gap-1 text-suave">
                        {m.faltanParaRendir.map((n) => (
                          <li key={n}>{n}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {m.habilita.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold">Es correlativa de:</span>
                      <span className="text-suave">{m.habilita.join(" · ")}</span>
                    </div>
                  )}

                  {!m.seDicta && <p className="text-suave">Esta electiva no se dicta actualmente.</p>}

                  <div className="flex flex-col gap-2">
                    <span className="font-semibold">Cambiar estado</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {BOTONES.map((b) => {
                        const actual = m.estado === b.estado;
                        return (
                          <button
                            key={b.estado}
                            type="button"
                            disabled={guardando || actual}
                            onClick={() => elegirEstado(m.id, b.estado)}
                            className={`h-10 rounded-xl text-xs font-semibold transition disabled:cursor-default ${
                              actual
                                ? "bg-acento text-white"
                                : "border border-linea bg-superficie hover:bg-fondo disabled:opacity-50"
                            }`}
                          >
                            {b.texto}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}