"use client";

import { useActionState, useState, useTransition } from "react";
import type { ConfigParciales } from "@/lib/logica/parciales";
import { guardarImportante } from "../acciones";

const NOTAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const campo =
  "h-11 w-full rounded-xl border border-linea bg-superficie px-3 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro";

export default function Importante({
  materiaId,
  texto,
  condiciones,
}: {
  materiaId: string;
  texto: string;
  condiciones: ConfigParciales;
}) {
  // Campos "controlados": así no se vacían cuando React reinicia el formulario después de guardar.
  const [cantidad, setCantidad] = useState(String(condiciones.cantidad));
  const [tieneTp, setTieneTp] = useState(condiciones.tieneTp);
  const [minimo, setMinimo] = useState(condiciones.minimo === null ? "" : String(condiciones.minimo));
  const [practica, setPractica] = useState(condiciones.practica === null ? "" : String(condiciones.practica));
  const [directa, setDirecta] = useState(condiciones.directa === null ? "" : String(condiciones.directa));
  const [anotaciones, setAnotaciones] = useState(texto);
  const [resultado, guardar, guardando] = useActionState(guardarImportante, null);

  // Enviamos el formulario "a mano" (y no con action={…}) para que React no reinicie los campos al guardar:
  // React 19 vuelve los desplegables a su primera opción aunque el valor se haya guardado bien.
  const [, iniciar] = useTransition();
  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    iniciar(() => guardar(datos));
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <input type="hidden" name="materia_id" value={materiaId} />
      <input type="hidden" name="tiene_tp" value={tieneTp ? "si" : "no"} />

      {/* Cómo se aprueba: lo usa la pestaña Parciales */}
      <section className="flex flex-col gap-4 rounded-3xl bg-superficie p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="font-bold">Cómo se aprueba</h2>
          <span className="text-sm text-suave">
            Con esto, en Parciales te decimos cómo vas. Si la materia no tiene promoción práctica o aprobación directa,
            elegí «No tiene».
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Cantidad de parciales</span>
            <select name="cantidad" value={cantidad} onChange={(e) => setCantidad(e.target.value)} className={campo}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">TP integrador</span>
            <div className="grid h-11 grid-cols-2 gap-1 rounded-xl bg-bloqueo p-1">
              {[false, true].map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  aria-pressed={tieneTp === v}
                  onClick={() => setTieneTp(v)}
                  className={`rounded-lg text-sm transition ${
                    tieneTp === v ? "bg-superficie font-bold shadow-sm" : "font-semibold text-suave"
                  }`}
                >
                  {v ? "Sí" : "No"}
                </button>
              ))}
            </div>
          </div>
          <SelectorNota nombre="minimo" etiqueta="Mínimo en cada parcial" valor={minimo} onCambiar={setMinimo} />
          <SelectorNota nombre="promocion_practica" etiqueta="Promoción práctica (promedio)" valor={practica} onCambiar={setPractica} />
          <SelectorNota nombre="aprobacion_directa" etiqueta="Aprobación directa (promedio)" valor={directa} onCambiar={setDirecta} />
        </div>
        <span className="text-xs text-suave">
          Si un parcial queda por debajo del mínimo, lo tenés que recuperar. La nota del recuperatorio reemplaza a la
          del parcial.
        </span>
      </section>

      {/* Texto libre */}
      <section className="flex flex-col gap-1.5 rounded-3xl bg-superficie p-5 shadow-sm">
        <label htmlFor="anotaciones" className="font-bold">
          Lo importante de esta materia
        </label>
        <span className="text-sm text-suave">
          Criterios del profe, fechas clave, horarios de consulta. Los apuntes de clase van en Archivos.
        </span>
        <textarea
          id="anotaciones"
          name="anotaciones"
          rows={7}
          maxLength={2000}
          value={anotaciones}
          onChange={(e) => setAnotaciones(e.target.value)}
          placeholder={"Ej.: Recuperatorio solo de un parcial.\nConsultas: jueves 18 h.\nEl final es oral."}
          className="mt-1 rounded-2xl border border-linea bg-superficie px-4 py-3 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro"
        />
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

function SelectorNota({
  nombre,
  etiqueta,
  valor,
  onCambiar,
}: {
  nombre: string;
  etiqueta: string;
  valor: string;
  onCambiar: (valor: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold">{etiqueta}</span>
      <select name={nombre} value={valor} onChange={(e) => onCambiar(e.target.value)} className={campo}>
        <option value="">No tiene</option>
        {NOTAS.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}