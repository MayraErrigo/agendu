"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ACEPTA, MAXIMO_POR_VEZ } from "@/lib/logica/archivos";
import { cancelarSubida, confirmarSubida, prepararSubida } from "./acciones";

type Avance = { nombre: string; estado: "esperando" | "subiendo" | "listo" | "error"; mensaje?: string };

// El botón "Subir archivos": elegís hasta 10 y van a la carpeta que estás mirando.
export default function SubirArchivos({ materiaId, carpeta }: { materiaId: string; carpeta: string }) {
  const router = useRouter();
  const selector = useRef<HTMLInputElement>(null);
  const [avance, setAvance] = useState<Avance[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  function actualizar(indice: number, cambios: Partial<Avance>) {
    setAvance((lista) => lista.map((a, i) => (i === indice ? { ...a, ...cambios } : a)));
  }

  async function subir(archivos: File[]) {
    setError(null);
    if (archivos.length > MAXIMO_POR_VEZ) {
      setError(`Podés subir hasta ${MAXIMO_POR_VEZ} archivos por vez.`);
      return;
    }
    setTrabajando(true);
    setAvance(archivos.map((a) => ({ nombre: a.name, estado: "esperando" })));

    // 1. El servidor revisa tipo, tamaño y espacio de cada uno.
    const preparado = await prepararSubida(
      materiaId,
      carpeta,
      archivos.map((a) => ({ nombre: a.name, tamano: a.size }))
    );
    if (preparado.error || !preparado.resultados) {
      setError(preparado.error ?? "No pudimos preparar la subida.");
      setAvance([]);
      setTrabajando(false);
      return;
    }

    // 2. Se suben de a uno, directo del navegador a Storage.
    const supabase = createClient();
    for (const [i, resultado] of preparado.resultados.entries()) {
      if (!resultado.ok) {
        actualizar(i, { estado: "error", mensaje: resultado.error });
        continue;
      }
      actualizar(i, { estado: "subiendo" });
      try {
        const { error: errorSubida } = await supabase.storage
          .from("archivos")
          .upload(resultado.ruta, archivos[i], { contentType: resultado.contentType, upsert: false });
        if (errorSubida) {
          await cancelarSubida(materiaId, resultado.id);
          actualizar(i, { estado: "error", mensaje: "No se pudo subir. Probá de nuevo." });
          continue;
        }
        // 3. El servidor revisa que el archivo sea lo que dice ser.
        const confirmado = await confirmarSubida(materiaId, resultado.id);
        actualizar(i, confirmado?.error ? { estado: "error", mensaje: confirmado.error } : { estado: "listo" });
      } catch {
        // Si se corta internet o algo falla en el medio, se avisa y se sigue con el próximo.
        actualizar(i, { estado: "error", mensaje: "Se cortó la subida. Probá de nuevo." });
      }
    }

    setTrabajando(false);
    if (selector.current) selector.current.value = "";
    router.refresh();
  }

  const terminados = avance.length > 0 && !trabajando;

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
          if (lista.length) subir(lista);
        }}
        disabled={trabajando}
      />
      <label
        htmlFor="subir-archivos"
        className={`flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-acento font-semibold text-white transition hover:bg-acento-hover ${
          trabajando ? "pointer-events-none opacity-50" : ""
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
                  {a.estado === "listo" ? "✅" : a.estado === "error" ? "⚠️" : a.estado === "subiendo" ? "⏳" : "•"}
                </span>
                <span className="min-w-0 flex-1 truncate">{a.nombre}</span>
              </span>
              {a.mensaje && <span className="pl-6 text-xs text-error">{a.mensaje}</span>}
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