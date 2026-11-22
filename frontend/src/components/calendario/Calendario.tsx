"use client";

import { useState } from "react";
import Link from "next/link";
import type { ItemCalendario } from "@/lib/datos/calendario";
import { TIPOS_FECHA, type TipoFecha } from "@/lib/logica/fechas";
import { diasDeSemana, grillaDelMes, moverMes, nombreDelDia, nombreDelMes, sumarDias } from "@/lib/logica/calendario";

// Color del puntito y de la etiqueta de cada tipo.
const PUNTO: Record<TipoFecha | "parcial", string> = {
  parcial: "bg-error",
  evaluacion: "bg-error",
  entrega: "bg-arena-tinta",
  leccion: "bg-pizarra-tinta",
  presentacion: "bg-pizarra-tinta",
  otro: "bg-bloqueo-tinta",
};

function etiqueta(tipo: TipoFecha | "parcial") {
  return tipo === "parcial" ? { nombre: "Parcial", chip: "bg-error-claro text-error" } : TIPOS_FECHA[tipo];
}

// El calendario de Inicio: una semana que se despliega a mes, y lo que hay el día elegido.
export default function Calendario({ items, hoy }: { items: ItemCalendario[]; hoy: string }) {
  const [elegido, setElegido] = useState(hoy);
  const [verMes, setVerMes] = useState(false);
  const [mes, setMes] = useState(() => ({ anio: Number(hoy.slice(0, 4)), mes: Number(hoy.slice(5, 7)) }));

  // Las fechas agrupadas por día, ordenadas por hora.
  const porDia = new Map<string, ItemCalendario[]>();
  for (const item of items) {
    porDia.set(item.fecha, [...(porDia.get(item.fecha) ?? []), item]);
  }
  for (const lista of porDia.values()) {
    lista.sort((a, b) => (a.hora ?? "99:99").localeCompare(b.hora ?? "99:99"));
  }

  const dias = verMes ? grillaDelMes(mes.anio, mes.mes) : diasDeSemana(elegido);
  const titulo = verMes ? nombreDelMes(mes.anio, mes.mes) : elegido === hoy || diasDeSemana(hoy).includes(elegido) ? "Esta semana" : `Semana del ${nombreDelDia(diasDeSemana(elegido)[0]).toLowerCase()}`;
  const delDia = porDia.get(elegido) ?? [];

  function mover(cuanto: number) {
    if (verMes) {
      setMes(moverMes(mes.anio, mes.mes, cuanto));
    } else {
      setElegido(sumarDias(elegido, 7 * cuanto));
    }
  }

  function alternar() {
    if (!verMes) setMes({ anio: Number(elegido.slice(0, 4)), mes: Number(elegido.slice(5, 7)) });
    setVerMes(!verMes);
  }

  return (
    <section className="flex flex-col gap-3 rounded-3xl bg-superficie p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">{titulo}</h2>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label={verMes ? "Mes anterior" : "Semana anterior"}
            onClick={() => mover(-1)}
            className="flex size-9 items-center justify-center rounded-xl bg-fondo transition hover:bg-bloqueo"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={verMes ? "Mes siguiente" : "Semana siguiente"}
            onClick={() => mover(1)}
            className="flex size-9 items-center justify-center rounded-xl bg-fondo transition hover:bg-bloqueo"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] font-semibold text-suave" aria-hidden="true">
        {["L", "M", "M", "J", "V", "S", "D"].map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {dias.map((dia, i) => {
          if (!dia) return <span key={`hueco-${i}`} />;
          const lista = porDia.get(dia) ?? [];
          const esElegido = dia === elegido;
          const esHoy = dia === hoy;
          const pasado = dia < hoy;
          return (
            <button
              key={dia}
              type="button"
              onClick={() => setElegido(dia)}
              aria-pressed={esElegido}
              aria-label={`${nombreDelDia(dia)}${lista.length ? `, ${lista.length === 1 ? "1 fecha" : `${lista.length} fechas`}` : ""}`}
              className={`flex h-12 flex-col items-center justify-center gap-1 rounded-xl transition ${
                esElegido
                  ? "bg-acento text-white"
                  : esHoy
                    ? "bg-acento-claro font-bold text-acento-hover"
                    : pasado
                      ? "text-suave/70 hover:bg-fondo"
                      : "hover:bg-fondo"
              }`}
            >
              <span className="text-sm font-semibold">{Number(dia.slice(8, 10))}</span>
              <span className="flex h-1.5 gap-0.5">
                {lista.slice(0, 3).map((item) => (
                  <span
                    key={item.id}
                    className={`size-1.5 rounded-full ${esElegido ? "bg-white" : pasado ? "bg-linea" : PUNTO[item.tipo]}`}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <button type="button" onClick={alternar} className="self-center px-3 py-1 text-sm font-bold text-acento hover:underline">
        {verMes ? "Ver solo la semana ▴" : "Ver el mes ▾"}
      </button>

      <div className="flex flex-col gap-2 border-t border-fondo pt-3">
        <span className="text-xs font-bold uppercase tracking-wider text-suave">
          {elegido === hoy ? `Hoy · ${nombreDelDia(elegido).toLowerCase()}` : nombreDelDia(elegido)}
        </span>
        {delDia.length ? (
          <ul className="flex flex-col gap-2">
            {delDia.map((item) => {
              const tipo = etiqueta(item.tipo);
              const pasado = item.fecha < hoy;
              const destino = item.origen === "parciales" ? "parciales" : "fechas";
              return (
                <li key={item.id}>
                  <Link
                    href={`/app/materia/${item.materiaId}/${destino}`}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-bloqueo ${pasado ? "bg-bloqueo/60 text-suave" : "bg-fondo"}`}
                  >
                    <span className={`min-w-[4.5rem] shrink-0 rounded-full px-2 py-1 text-center text-[11px] font-bold ${pasado ? "bg-bloqueo text-bloqueo-tinta" : tipo.chip}`}>
                      {tipo.nombre}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm font-semibold leading-snug">{item.titulo}</span>
                      <span className="truncate text-xs text-suave">
                        {item.materia}
                        {item.hora ? ` · ${item.hora}` : ""}
                      </span>
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-suave" aria-hidden="true">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-suave">No tenés fechas este día.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-[11px] text-suave">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-error" /> Parcial / Evaluación
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-arena-tinta" /> Entrega
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-pizarra-tinta" /> Lección / Presentación
        </span>
      </div>

           <Link
        href="/app/calendario/importar"
        className="flex items-center gap-3 rounded-2xl border border-dashed border-suave p-3 transition hover:border-acento hover:bg-fondo"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-acento-claro text-acento-hover">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 4v12M7 11l5 5 5-5M5 20h14" />
          </svg>
        </span>
        <span className="flex flex-1 flex-col">
          <span className="text-sm font-bold">Traer fechas de la UV</span>
          <span className="text-xs text-suave">O de Google, Apple u Outlook</span>
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-suave" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </Link>
    </section>
  );
}