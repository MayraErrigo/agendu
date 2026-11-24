"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ACEPTA, MAXIMO_POR_VEZ } from "@/lib/logica/archivos";
import type { Repetido } from "@/lib/logica/repetidos";
import { borrarArchivo, cancelarSubida, confirmarSubida, prepararSubida, revisarRepetidos } from "./acciones";

type Avance = {
  nombre: string;
  estado: "esperando" | "subiendo" | "listo" | "error" | "repetido" | "omitido";
  mensaje?: string;
  repetido?: Repetido;
};

// Lo que se manda a subir: el archivo, con qué nombre se guarda y, si reemplaza a otro, cuál.
type Pedido = { indice: number; archivo: File; nombre: string; reemplaza?: string };

// El botón "Subir archivos": elegís hasta 10 y van a la carpeta que estás mirando.
// Si alguno ya está en la carpeta, se frena y pregunta qué hacer.
export default function SubirArchivos({ materiaId, carpeta }: { materiaId: string; carpeta: string }) {
  const router = useRouter();
  const selector = useRef<HTMLInputElement>(null);
  const elegidos = useRef<File[]>([]);
  const [avance, setAvance] = useState<Avance[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  function actualizar(indice: number, cambios: Partial<Avance>) {
    setAvance((lista) => lista.map((a, i) => (i === indice ? { ...a, ...cambios } : a)));
  }

  // Sube una tanda de archivos: el servidor los revisa, se suben de a uno y se confirman.
  async function subirPedidos(pedidos: Pedido[]) {
    if (!pedidos.length) return;
    setTrabajando(true);

    // 1. El servidor revisa tipo, tamaño y espacio de cada uno.
    const preparado = await prepararSubida(
      materiaId,
      carpeta,
      pedidos.map((p) => ({ nombre: p.nombre, tamano: p.archivo.size }))
    );
    if (preparado.error || !preparado.resultados) {
      for (const p of pedidos) actualizar(p.indice, { estado: "error", mensaje: preparado.error ?? "No pudimos preparar la subida." });
      setTrabajando(false);
      return;
    }

    // 2. Se suben de a uno, directo del navegador a Storage.
    const supabase = createClient();
    for (const [j, resultado] of preparado.resultados.entries()) {
      const { indice, archivo, reemplaza } = pedidos[j];
      if (!resultado.ok) {
        actualizar(indice, { estado: "error", mensaje: resultado.error });
        continue;
      }
      actualizar(indice, { estado: "subiendo", mensaje: undefined });
      try {
        const { error: errorSubida } = await supabase.storage
          .from("archivos")
          .upload(resultado.ruta, archivo, { contentType: resultado.contentType, upsert: false });
        if (errorSubida) {
          await cancelarSubida(materiaId, resultado.id);
          actualizar(indice, { estado: "error", mensaje: "No se pudo subir. Probá de nuevo." });
          continue;
        }
        // 3. El servidor revisa que el archivo sea lo que dice ser.
        const confirmado = await confirmarSubida(materiaId, resultado.id);
        if (confirmado?.error) {
          actualizar(indice, { estado: "error", mensaje: confirmado.error });
          continue;
        }
        // 4. Si reemplazaba a otro, recién ahora (con el nuevo ya guardado) se borra el viejo.
        if (reemplaza) {
          const borrado = await borrarArchivo(materiaId, reemplaza);
          actualizar(
            indice,
            borrado?.error
              ? { estado: "listo", mensaje: "Se subió, pero no pudimos borrar el anterior. Borralo a mano." }
              : { estado: "listo", mensaje: "Reemplazó al anterior." }
          );
        } else {
          actualizar(indice, { estado: "listo" });
        }
      } catch {
        // Si se corta internet o algo falla en el medio, se avisa y se sigue con el próximo.
        actualizar(indice, { estado: "error", mensaje: "Se cortó la subida. Probá de nuevo." });
      }
    }

    setTrabajando(false);
    router.refresh();
  }

  async function elegir(archivos: File[]) {
    setError(null);
    if (archivos.length > MAXIMO_POR_VEZ) {
      setError(`Podés subir hasta ${MAXIMO_POR_VEZ} archivos por vez.`);
      return;
    }
    elegidos.current = archivos;
    setAvance(archivos.map((a) => ({ nombre: a.name, estado: "esperando" })));
    setTrabajando(true);

    // Antes de subir: ¿alguno ya está en esta carpeta?
    const revision = await revisarRepetidos(
      materiaId,
      carpeta,
      archivos.map((a) => ({ nombre: a.name, tamano: a.size }))
    );
    if (revision.error || !revision.repetidos) {
      setError(revision.error ?? "No pudimos preparar la subida.");
      setAvance([]);
      setTrabajando(false);
      return;
    }

    // Los repetidos esperan a que elijas qué hacer; los demás se suben ya.
    const pedidos: Pedido[] = [];
    revision.repetidos.forEach((repetido, i) => {
      if (repetido) actualizar(i, { estado: "repetido", repetido });
      else pedidos.push({ indice: i, archivo: archivos[i], nombre: archivos[i].name });
    });
    if (selector.current) selector.current.value = "";
    if (pedidos.length) await subirPedidos(pedidos);
    else setTrabajando(false);
  }

  function noSubir(i: number) {
    actualizar(i, { estado: "omitido", mensaje: "No se subió.", repetido: undefined });
  }

  function subirIgual(i: number, repetido: Repetido) {
    actualizar(i, { estado: "esperando", repetido: undefined });
    subirPedidos([{ indice: i, archivo: elegidos.current[i], nombre: repetido.nombreLibre }]);
  }

  function reemplazar(i: number, repetido: Repetido) {
    actualizar(i, { estado: "esperando", repetido: undefined });
    subirPedidos([{ indice: i, archivo: elegidos.current[i], nombre: elegidos.current[i].name, reemplaza: repetido.id }]);
  }

  const hayPendientes = avance.some((a) => a.estado === "repetido");
  const bloqueado = trabajando || hayPendientes;
  const terminados = avance.length > 0 && !bloqueado;

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={selector}
        type="file"
        multiple
        accept={ACEPTA}
        className="sr-only"
        id="subir-archivos"
        onChange={(e) => {
          const lista = Array.from(e.target.files ?? []);
          if (lista.length) elegir(lista);
        }}
        disabled={bloqueado}
      />
      <label
        htmlFor="subir-archivos"
        className={`flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-acento font-semibold text-white transition hover:bg-acento-hover ${
          bloqueado ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
        </svg>
        {trabajando ? "Subiendo…" : "Subir archivos"}
      </label>
      <span className="text-center text-xs text-suave">
        PDF, fotos, Word, Excel o PowerPoint · hasta {MAXIMO_POR_VEZ} por vez
      </span>

      {error && (
        <p role="alert" className="rounded-xl bg-error-claro px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      {avance.length > 0 && (
        <ul className="flex flex-col gap-1.5 rounded-2xl bg-superficie p-3 shadow-sm" aria-live="polite">
          {avance.map((a, i) => (
            <li key={i} className="flex flex-col text-sm">
              <span className="flex items-center gap-2">
                <span aria-hidden="true">
                  {a.estado === "listo"
                    ? "✅"
                    : a.estado === "error"
                      ? "⚠️"
                      : a.estado === "subiendo"
                        ? "⏳"
                        : a.estado === "repetido"
                          ? "📄"
                          : a.estado === "omitido"
                            ? "–"
                            : "•"}
                </span>
                <span className="min-w-0 flex-1 truncate">{a.nombre}</span>
              </span>

              {a.estado === "repetido" && a.repetido && (
                <div className="mt-1.5 flex flex-col gap-2 rounded-xl bg-arena p-3 text-arena-tinta">
                  <span className="text-xs font-semibold">
                    {a.repetido.tipo === "igual"
                      ? "Ya subiste este archivo en esta carpeta."
                      : "Ya tenés un archivo con este nombre. ¿Es una versión nueva?"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => noSubir(i)}
                      className="h-9 rounded-lg bg-acento px-3 text-xs font-semibold text-white hover:bg-acento-hover"
                    >
                      No subir
                    </button>
                    {a.repetido.tipo === "nombre" && (
                      <button
                        type="button"
                        disabled={trabajando}
                        onClick={() => reemplazar(i, a.repetido!)}
                        className="h-9 rounded-lg border border-linea bg-superficie px-3 text-xs font-semibold text-tinta disabled:opacity-50"
                      >
                        Reemplazar
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={trabajando}
                      onClick={() => subirIgual(i, a.repetido!)}
                      className="h-9 rounded-lg border border-linea bg-superficie px-3 text-xs font-semibold text-tinta disabled:opacity-50"
                    >
                      Subir igual
                    </button>
                  </div>
                  <span className="text-[11px]">
                    «Subir igual» lo guarda como «{a.repetido.nombreLibre}».
                  </span>
                </div>
              )}

              {a.mensaje && (
                <span className={`pl-6 text-xs ${a.estado === "error" ? "text-error" : "text-suave"}`}>{a.mensaje}</span>
              )}
            </li>
          ))}
          {terminados && (
            <li>
              <button type="button" onClick={() => setAvance([])} className="text-xs font-semibold text-acento hover:underline">
                Cerrar
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}