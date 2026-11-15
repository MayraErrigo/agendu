"use client";

import { useActionState, useState } from "react";
import type { EstadoMateria, Materia } from "@/lib/datos/plan";
import { guardarAvance } from "./acciones";

// Al tocar una materia, pasa al siguiente estado.
const SIGUIENTE: Record<EstadoMateria, EstadoMateria> = {
  pendiente: "aprobada",
  aprobada: "regular",
  regular: "cursando",
  cursando: "pendiente",
};

const ESTILO: Record<EstadoMateria, { texto: string; clases: string }> = {
  aprobada: { texto: "Aprobada", clases: "bg-acento-claro text-acento-hover border-acento-claro" },
  regular: { texto: "Regular", clases: "bg-arena text-arena-tinta border-arena" },
  cursando: { texto: "Cursando", clases: "bg-pizarra text-pizarra-tinta border-pizarra" },
  pendiente: { texto: "Pendiente", clases: "bg-superficie text-suave border-linea" },
};

type Grupo = { clave: string; titulo: string; materias: Materia[]; esElectiva: boolean };

export default function CargarAvance({
  grupos,
  estadosIniciales,
}: {
  grupos: Grupo[];
  estadosIniciales: Record<string, EstadoMateria>;
}) {
  const [estados, setEstados] = useState<Record<string, EstadoMateria>>(estadosIniciales);
  const [abierto, setAbierto] = useState<string | null>(grupos[0]?.clave ?? null);
  const [estado, guardar, guardando] = useActionState(guardarAvance, null);

  const estadoDe = (id: string): EstadoMateria => estados[id] ?? "pendiente";

  function cambiar(id: string) {
    setEstados((previos) => ({ ...previos, [id]: SIGUIENTE[previos[id] ?? "pendiente"] }));
  }

  function marcarGrupo(grupo: Grupo, nuevo: EstadoMateria) {
    setEstados((previos) => {
      const copia = { ...previos };
      for (const m of grupo.materias) copia[m.id] = nuevo;
      return copia;
    });
  }

  // Mandamos el estado de todas las materias, incluidas las pendientes.
  const todos: Record<string, EstadoMateria> = {};
  for (const grupo of grupos) for (const m of grupo.materias) todos[m.id] = estadoDe(m.id);

  return (
    <form action={guardar} className="flex flex-1 flex-col">
      <div className="flex flex-col gap-3">
        {grupos.map((grupo) => {
          const aprobadas = grupo.materias.filter((m) => estadoDe(m.id) === "aprobada").length;
          const completo = !grupo.esElectiva && aprobadas === grupo.materias.length;
          const estaAbierto = abierto === grupo.clave;

          return (
            <section key={grupo.clave} className="rounded-2xl bg-superficie">
              <button
                type="button"
                onClick={() => setAbierto(estaAbierto ? null : grupo.clave)}
                aria-expanded={estaAbierto}
                className="flex w-full items-center gap-3 px-4 py-4 text-left"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
                    completo ? "bg-acento text-white" : "bg-fondo text-suave"
                  }`}
                  aria-hidden="true"
                >
                  {completo ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  ) : (
                    <span className="text-sm font-bold">{grupo.esElectiva ? "E" : grupo.titulo.charAt(0)}</span>
                  )}
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="font-bold">{grupo.titulo}</span>
                  <span className="text-sm text-suave">
                    {grupo.esElectiva
                      ? `${aprobadas} aprobadas · ${grupo.materias.length} disponibles`
                      : `${aprobadas} de ${grupo.materias.length} aprobadas`}
                  </span>
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-suave transition ${estaAbierto ? "rotate-180" : ""}`}
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {estaAbierto && (
                <div className="flex flex-col gap-3 px-4 pb-4">
                  {grupo.esElectiva ? (
                    <p className="text-sm text-suave">
                      Marcá solo las electivas que cursaste o aprobaste. No hace falta hacerlas todas.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => marcarGrupo(grupo, "aprobada")}
                        className="h-11 rounded-xl border border-linea text-sm font-semibold transition hover:bg-fondo"
                      >
                        Aprobé todo
                      </button>
                      <button
                        type="button"
                        onClick={() => marcarGrupo(grupo, "pendiente")}
                        className="h-11 rounded-xl border border-linea text-sm font-semibold transition hover:bg-fondo"
                      >
                        Desmarcar todo
                      </button>
                    </div>
                  )}

                  <ul className="flex flex-col">
                    {grupo.materias.map((m) => {
                      const e = estadoDe(m.id);
                      return (
                        <li key={m.id} className="flex items-center gap-3 border-t border-fondo py-2.5">
                          <span className="flex flex-1 flex-col">
                            <span className="text-[15px] font-medium leading-snug">{m.nombre}</span>
                            {grupo.esElectiva && (
                              <span className="text-xs text-suave">
                                {m.nivel}º año
                                {m.creditos ? ` · ${m.creditos} ${m.creditos === 1 ? "crédito" : "créditos"}` : ""}
                                {m.se_dicta ? "" : " · No se dicta actualmente"}
                              </span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => cambiar(m.id)}
                            aria-label={`${m.nombre}: ${ESTILO[e].texto}. Tocá para cambiar.`}
                            className={`h-9 min-w-24 shrink-0 rounded-full border px-3 text-[13px] font-semibold transition ${ESTILO[e].clases}`}
                          >
                            {ESTILO[e].texto}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <input type="hidden" name="estados" value={JSON.stringify(todos)} />

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <p className="text-center text-sm text-suave">
          Tocá cada materia para cambiar: aprobada, regular, cursando o pendiente.
        </p>
        {estado?.error && (
          <p role="alert" className="rounded-xl bg-error-claro px-4 py-3 text-sm text-error">
            {estado.error}
          </p>
        )}
        <button
          type="submit"
          disabled={guardando}
          className="h-14 rounded-2xl bg-acento font-semibold text-white transition hover:bg-acento-hover disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Ver mi carrera"}
        </button>
      </div>
    </form>
  );
}