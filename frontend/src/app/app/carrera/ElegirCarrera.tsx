"use client";

import { useActionState, useState } from "react";
import type { Oferta } from "@/lib/datos/carreras";
import { guardarCarrera } from "./acciones";

type Opcion = { id: string; titulo: string; detalle?: string };

// Quita repetidos manteniendo el orden.
function unicas(opciones: Opcion[]): Opcion[] {
  const resultado: Opcion[] = [];
  for (const o of opciones) {
    if (!resultado.some((r) => r.id === o.id)) resultado.push(o);
  }
  return resultado;
}

// Si hay una sola opción, queda elegida sola.
function elegida(valor: string | null, opciones: Opcion[]): string | null {
  if (valor && opciones.some((o) => o.id === valor)) return valor;
  return opciones.length === 1 ? opciones[0].id : null;
}

export default function ElegirCarrera({
  ofertas,
  actual,
}: {
  ofertas: Oferta[];
  actual: { regionalId: string | null; planId: string | null };
}) {
  const inicial = ofertas.find((o) => o.regionalId === actual.regionalId && o.planId === actual.planId);

  const [universidadElegida, setUniversidad] = useState<string | null>(inicial?.universidadId ?? null);
  const [regionalElegida, setRegional] = useState<string | null>(inicial?.regionalId ?? null);
  const [carreraElegida, setCarrera] = useState<string | null>(inicial?.carreraId ?? null);
  const [planElegido, setPlan] = useState<string | null>(inicial?.planId ?? null);
  const [estado, guardar, guardando] = useActionState(guardarCarrera, null);

  const universidades = unicas(
    ofertas.map((o) => ({ id: o.universidadId, titulo: o.universidadSigla, detalle: o.universidadNombre }))
  );
  const universidad = elegida(universidadElegida, universidades);

  const regionales = unicas(
    ofertas
      .filter((o) => o.universidadId === universidad)
      .map((o) => ({ id: o.regionalId, titulo: o.regionalNombre, detalle: o.regionalSigla }))
  );
  const regional = elegida(regionalElegida, regionales);

  const carreras = unicas(
    ofertas
      .filter((o) => o.universidadId === universidad && o.regionalId === regional)
      .map((o) => ({ id: o.carreraId, titulo: o.carreraNombre }))
  );
  const carrera = elegida(carreraElegida, carreras);

  const planes = unicas(
    ofertas
      .filter((o) => o.regionalId === regional && o.carreraId === carrera)
      .map((o) => ({ id: o.planId, titulo: o.planNombre, detalle: o.planVigente ? "Vigente" : "Anterior" }))
  );
  const plan = elegida(planElegido, planes);

  const listo = Boolean(regional && plan);

  return (
    <form action={guardar} className="flex flex-1 flex-col">
      <div className="flex flex-col gap-6">
        <Grupo
          titulo="Universidad"
          nombre="universidad"
          opciones={universidades}
          valor={universidad}
          onElegir={(id) => {
            setUniversidad(id);
            setRegional(null);
            setCarrera(null);
            setPlan(null);
          }}
        />
        {universidad && (
          <Grupo
            titulo="Facultad regional"
            nombre="regional"
            opciones={regionales}
            valor={regional}
            onElegir={(id) => {
              setRegional(id);
              setCarrera(null);
              setPlan(null);
            }}
          />
        )}
        {regional && (
          <Grupo
            titulo="Carrera"
            nombre="carrera"
            opciones={carreras}
            valor={carrera}
            onElegir={(id) => {
              setCarrera(id);
              setPlan(null);
            }}
          />
        )}
        {carrera && (
          <Grupo titulo="Plan de estudios" nombre="plan" opciones={planes} valor={plan} onElegir={setPlan} />
        )}
      </div>

      <input type="hidden" name="regional_id" value={regional ?? ""} />
      <input type="hidden" name="plan_id" value={plan ?? ""} />

      <div className="mt-auto flex flex-col gap-3 pt-8">
        {estado?.error && (
          <p role="alert" className="rounded-xl bg-error-claro px-4 py-3 text-sm text-error">
            {estado.error}
          </p>
        )}
        <button
          type="submit"
          disabled={!listo || guardando}
          className="h-14 rounded-2xl bg-acento font-semibold text-white transition hover:bg-acento-hover disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Continuar"}
        </button>
      </div>
    </form>
  );
}

function Grupo({
  titulo,
  nombre,
  opciones,
  valor,
  onElegir,
}: {
  titulo: string;
  nombre: string;
  opciones: Opcion[];
  valor: string | null;
  onElegir: (id: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-suave">{titulo}</legend>
      {opciones.map((o) => {
        const activa = o.id === valor;
        return (
          <label
            key={o.id}
            className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border bg-superficie px-4 py-3 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-acento ${
              activa ? "border-2 border-acento" : "border-linea hover:border-suave"
            }`}
          >
            <input
              type="radio"
              name={nombre}
              value={o.id}
              checked={activa}
              onChange={() => onElegir(o.id)}
              className="sr-only"
            />
            <span className="flex flex-1 flex-col">
              <span className="font-semibold leading-snug">{o.titulo}</span>
              {o.detalle && <span className="text-sm text-suave">{o.detalle}</span>}
            </span>
            {activa && (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-acento" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            )}
          </label>
        );
      })}
    </fieldset>
  );
}