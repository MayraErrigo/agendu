"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { partesDeFecha, TIPOS_FECHA, type ItemFecha, type TipoFecha } from "@/lib/logica/fechas";
import { borrarFecha, guardarFecha, type EstadoFecha } from "./acciones";

const campo =
  "h-11 w-full rounded-xl border border-linea bg-superficie px-3 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro";

type Formulario = { modo: "nueva" } | { modo: "editar"; item: ItemFecha } | null;

// Pestaña Fechas: las fechas importantes de la materia, para cargar y ver.
export default function Fechas({
  materiaId,
  proximas,
  pasadas,
}: {
  materiaId: string;
  proximas: ItemFecha[];
  pasadas: ItemFecha[];
}) {
  const [formulario, setFormulario] = useState<Formulario>(null);

  return (
    <div className="flex flex-col gap-5">
      {formulario ? (
        <FormularioFecha
          key={formulario.modo === "editar" ? formulario.item.id : "nueva"}
          materiaId={materiaId}
          item={formulario.modo === "editar" ? formulario.item : null}
          alCerrar={() => setFormulario(null)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setFormulario({ modo: "nueva" })}
          className="h-14 rounded-2xl bg-acento font-semibold text-white transition hover:bg-acento-hover"
        >
          + Agregar fecha
        </button>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-suave">Próximas</h2>
        {proximas.length ? (
          <ul className="flex flex-col gap-2">
            {proximas.map((f) => (
              <FilaFecha key={f.id} materiaId={materiaId} item={f} alEditar={() => setFormulario({ modo: "editar", item: f })} />
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl bg-superficie px-4 py-4 text-sm text-suave shadow-sm">
            No tenés fechas próximas en esta materia.
          </p>
        )}
      </section>

      {pasadas.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-suave">Ya pasaron</h2>
          <ul className="flex flex-col gap-2">
            {pasadas.map((f) => (
              <FilaFecha key={f.id} materiaId={materiaId} item={f} pasada alEditar={() => setFormulario({ modo: "editar", item: f })} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function FormularioFecha({
  materiaId,
  item,
  alCerrar,
}: {
  materiaId: string;
  item: ItemFecha | null;
  alCerrar: () => void;
}) {
  const [tipo, setTipo] = useState<TipoFecha>(item && item.tipo !== "parcial" ? item.tipo : "entrega");
  // Al guardar bien, se cierra el formulario.
  const [resultado, guardar, guardando] = useActionState(async (anterior: EstadoFecha, datos: FormData) => {
    const r = await guardarFecha(anterior, datos);
    if (r?.ok) alCerrar();
    return r;
  }, null);

  return (
    <form action={guardar} className="flex flex-col gap-3 rounded-3xl bg-superficie p-5 shadow-sm">
      <input type="hidden" name="materia_id" value={materiaId} />
      <input type="hidden" name="tipo" value={tipo} />
      {item && <input type="hidden" name="fecha_id" value={item.id} />}

      <h2 className="font-bold">{item ? "Editar fecha" : "Nueva fecha"}</h2>

      <fieldset className="flex flex-wrap gap-1.5">
        <legend className="sr-only">Tipo</legend>
        {(Object.keys(TIPOS_FECHA) as TipoFecha[]).map((t) => {
          const activo = t === tipo;
          return (
            <button
              key={t}
              type="button"
              aria-pressed={activo}
              onClick={() => setTipo(t)}
              className={`h-9 rounded-full px-3 text-sm font-bold transition ${
                activo ? `${TIPOS_FECHA[t].chip} ring-2 ring-current` : "border border-linea bg-superficie text-suave hover:bg-fondo"
              }`}
            >
              {TIPOS_FECHA[t].nombre}
            </button>
          );
        })}
      </fieldset>

      <label htmlFor="titulo-fecha" className="text-sm font-semibold">
        ¿Qué es?
      </label>
      <input
        id="titulo-fecha"
        name="titulo"
        type="text"
        required
        maxLength={120}
        defaultValue={item?.titulo ?? ""}
        placeholder={TIPOS_FECHA[tipo].ejemplo}
        className={campo}
      />

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Fecha</span>
          <input name="fecha" type="date" required defaultValue={item?.fecha ?? ""} className={campo} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">
            Hora <span className="font-normal text-suave">(opcional)</span>
          </span>
          <input name="hora" type="time" defaultValue={item?.hora ?? ""} className={campo} />
        </label>
      </div>

      {resultado?.error && (
        <p role="alert" className="rounded-xl bg-error-claro px-4 py-3 text-sm text-error">
          {resultado.error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={guardando}
          className="h-12 flex-1 rounded-xl bg-acento font-semibold text-white transition hover:bg-acento-hover disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" onClick={alCerrar} className="h-12 rounded-xl border border-linea px-4 font-semibold hover:bg-fondo">
          Cancelar
        </button>
      </div>
    </form>
  );
}

function FilaFecha({
  materiaId,
  item,
  pasada = false,
  alEditar,
}: {
  materiaId: string;
  item: ItemFecha;
  pasada?: boolean;
  alEditar: () => void;
}) {
  const [menu, setMenu] = useState<"cerrado" | "abierto" | "borrar">("cerrado");
  const [error, setError] = useState<string | null>(null);
  const [borrando, iniciar] = useTransition();
  const partes = partesDeFecha(item.fecha);
  const esParcial = item.tipo === "parcial";
  const tipo = esParcial ? { nombre: "Parcial", chip: "bg-error-claro text-error" } : TIPOS_FECHA[item.tipo as TipoFecha];

  function confirmarBorrado() {
    setError(null);
    iniciar(async () => {
      const r = await borrarFecha(item.id);
      if (r?.error) setError(r.error);
    });
  }

  return (
    <li className={`rounded-2xl ${pasada ? "bg-bloqueo text-bloqueo-tinta" : "bg-superficie shadow-sm"}`}>
      <div className="flex items-center gap-3 p-3">
        <span className="flex w-11 shrink-0 flex-col items-center">
          <span className="text-[11px] font-bold text-suave">{partes.dia}</span>
          <span className="text-xl font-extrabold leading-none">{partes.numero}</span>
          <span className="text-[11px] text-suave">{partes.mes}</span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="font-semibold leading-snug">
            {item.titulo}
            {item.hora ? ` · ${item.hora}` : ""}
          </span>
          <span className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${pasada ? "bg-superficie/60" : tipo.chip}`}>
              {tipo.nombre}
            </span>
            {item.origen === "uv" && (
              <span className="rounded-full bg-bloqueo px-2 py-0.5 text-[11px] font-semibold text-bloqueo-tinta">Desde la UV</span>
            )}
            {item.origen === "calendario" && (
              <span className="rounded-full bg-bloqueo px-2 py-0.5 text-[11px] font-semibold text-bloqueo-tinta">Importada</span>
            )}
            {esParcial && (
              <Link href={`/app/materia/${materiaId}/parciales`} className="text-[11px] font-semibold text-acento hover:underline">
                Se edita en Parciales
              </Link>
            )}
          </span>
        </span>
        {!esParcial && (
          <button
            type="button"
            aria-label="Opciones de la fecha"
            aria-expanded={menu !== "cerrado"}
            onClick={() => setMenu(menu === "cerrado" ? "abierto" : "cerrado")}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-suave transition hover:bg-fondo"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        )}
      </div>

      {menu === "abierto" && (
        <div className="flex gap-4 border-t border-fondo px-3 py-3 text-sm">
          <button
            type="button"
            onClick={() => {
              setMenu("cerrado");
              alEditar();
            }}
            className="font-semibold text-acento hover:underline"
          >
            Editar
          </button>
          <button type="button" onClick={() => setMenu("borrar")} className="font-semibold text-error hover:underline">
            Borrar
          </button>
        </div>
      )}

      {menu === "borrar" && (
        <div className="flex flex-col gap-2 border-t border-fondo p-3 text-sm">
          <p className="text-error">
            <span className="font-bold">¿Borrar «{item.titulo}»?</span>
          </p>
          {error && <p role="alert" className="text-error">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={borrando}
              onClick={confirmarBorrado}
              className="h-10 flex-1 rounded-xl bg-error font-semibold text-white disabled:opacity-50"
            >
              {borrando ? "Borrando…" : "Sí, borrar"}
            </button>
            <button
              type="button"
              onClick={() => setMenu("cerrado")}
              className="h-10 flex-1 rounded-xl border border-linea bg-superficie font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </li>
  );
}