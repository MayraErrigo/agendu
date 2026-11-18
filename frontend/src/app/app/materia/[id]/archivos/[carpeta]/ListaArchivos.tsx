"use client";

import { useState, useTransition } from "react";
import type { Archivo } from "@/lib/datos/archivos";
import type { Carpeta } from "@/lib/logica/carpetas";
import { formatearTamano, TIPOS, type Extension } from "@/lib/logica/archivos";
import { borrarArchivo, moverArchivo, renombrarArchivo } from "./acciones";

const COLOR: Record<Extension, string> = {
  pdf: "bg-error-claro text-error",
  jpg: "bg-pizarra text-pizarra-tinta",
  png: "bg-pizarra text-pizarra-tinta",
  heic: "bg-pizarra text-pizarra-tinta",
  docx: "bg-pizarra text-pizarra-tinta",
  xlsx: "bg-acento-claro text-acento-hover",
  pptx: "bg-arena text-arena-tinta",
};

// La lista de archivos de una carpeta. Tocás uno para abrirlo; "···" para renombrar, mover o borrar.
export default function ListaArchivos({
  materiaId,
  archivos,
  carpetas,
  carpetaActual,
}: {
  materiaId: string;
  archivos: Archivo[];
  carpetas: Carpeta[];
  carpetaActual: string;
}) {
  const [abierto, setAbierto] = useState<string | null>(null);

  if (!archivos.length) {
    return (
      <p className="rounded-2xl bg-superficie px-4 py-6 text-center text-sm text-suave shadow-sm">
        Esta carpeta está vacía.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {archivos.map((a) => (
        <FilaArchivo
          key={a.id}
          materiaId={materiaId}
          archivo={a}
          otrasCarpetas={carpetas.filter((c) => c.id !== carpetaActual)}
          menuAbierto={abierto === a.id}
          onMenu={() => setAbierto(abierto === a.id ? null : a.id)}
        />
      ))}
    </ul>
  );
}

function FilaArchivo({
  materiaId,
  archivo,
  otrasCarpetas,
  menuAbierto,
  onMenu,
}: {
  materiaId: string;
  archivo: Archivo;
  otrasCarpetas: Carpeta[];
  menuAbierto: boolean;
  onMenu: () => void;
}) {
  const [modo, setModo] = useState<"menu" | "renombrar" | "mover" | "borrar">("menu");
  const [nombre, setNombre] = useState(archivo.nombre);
  const [error, setError] = useState<string | null>(null);
  const [trabajando, iniciar] = useTransition();
  const tipo = TIPOS[archivo.extension];

  function accion(funcion: () => Promise<{ error?: string } | null>) {
    setError(null);
    iniciar(async () => {
      const r = await funcion();
      if (r?.error) setError(r.error);
      else {
        setModo("menu");
        onMenu();
      }
    });
  }

  const fecha = new Date(archivo.creadoEn).toLocaleDateString("es-AR", { day: "numeric", month: "short" });

  return (
    <li className="rounded-2xl bg-superficie shadow-sm">
      <div className="flex items-center gap-3 p-3">
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-[11px] font-extrabold ${COLOR[archivo.extension]}`}>
          {archivo.extension.toUpperCase()}
        </span>
        {archivo.link ? (
          <a href={archivo.link} target="_blank" rel="noopener noreferrer" className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-semibold">{archivo.nombre}</span>
            <span className="text-xs text-suave" suppressHydrationWarning>
              {tipo.etiqueta} · {formatearTamano(archivo.tamano)} · {fecha} · {tipo.abrir ? "Abrir" : "Descargar"}
            </span>
          </a>
        ) : (
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-semibold">{archivo.nombre}</span>
            <span className="text-xs text-error">No pudimos generar el link. Recargá la página.</span>
          </span>
        )}
        <button
          type="button"
          aria-label="Opciones del archivo"
          aria-expanded={menuAbierto}
          onClick={() => {
            setModo("menu");
            setError(null);
            onMenu();
          }}
          className="flex size-9 shrink-0 items-center justify-center rounded-xl text-suave transition hover:bg-fondo"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>

      {menuAbierto && (
        <div className="flex flex-col gap-3 border-t border-fondo p-3 text-sm">
          {modo === "menu" && (
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <button type="button" onClick={() => setModo("renombrar")} className="font-semibold text-acento hover:underline">
                Cambiar nombre
              </button>
              <button type="button" onClick={() => setModo("mover")} className="font-semibold text-acento hover:underline">
                Mover a…
              </button>
              <button type="button" onClick={() => setModo("borrar")} className="font-semibold text-error hover:underline">
                Borrar
              </button>
            </div>
          )}

          {modo === "renombrar" && (
            <div className="flex gap-2">
              <label htmlFor={`nombre-${archivo.id}`} className="sr-only">
                Nuevo nombre
              </label>
              <input
                id={`nombre-${archivo.id}`}
                type="text"
                value={nombre}
                maxLength={120}
                autoFocus
                onChange={(e) => setNombre(e.target.value)}
                className="h-11 min-w-0 flex-1 rounded-xl border border-linea bg-superficie px-3 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro"
              />
              <button
                type="button"
                disabled={trabajando}
                onClick={() => accion(() => renombrarArchivo(materiaId, archivo.id, nombre))}
                className="h-11 shrink-0 rounded-xl bg-acento px-4 font-semibold text-white disabled:opacity-50"
              >
                {trabajando ? "…" : "Guardar"}
              </button>
            </div>
          )}

          {modo === "mover" && (
            <div className="flex flex-col gap-2">
              <span className="font-semibold">¿A qué carpeta?</span>
              <div className="flex flex-wrap gap-2">
                {otrasCarpetas.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={trabajando}
                    onClick={() => accion(() => moverArchivo(materiaId, archivo.id, c.id))}
                    className={`rounded-full px-3 py-1.5 font-medium transition disabled:opacity-50 ${
                      c.fija ? "bg-arena text-arena-tinta" : "bg-acento-claro text-acento-hover"
                    }`}
                  >
                    {c.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {modo === "borrar" && (
            <div className="flex flex-col gap-2 rounded-xl bg-error-claro p-3">
              <p className="text-error">
                <span className="font-bold">¿Borrar «{archivo.nombre}»?</span> No se puede recuperar.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={trabajando}
                  onClick={() => accion(() => borrarArchivo(materiaId, archivo.id))}
                  className="h-10 flex-1 rounded-xl bg-error font-semibold text-white disabled:opacity-50"
                >
                  {trabajando ? "Borrando…" : "Sí, borrar"}
                </button>
                <button
                  type="button"
                  onClick={() => setModo("menu")}
                  className="h-10 flex-1 rounded-xl border border-linea bg-superficie font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="text-error">
              {error}
            </p>
          )}
        </div>
      )}
    </li>
  );
}