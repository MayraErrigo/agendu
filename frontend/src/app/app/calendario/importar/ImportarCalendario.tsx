"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { partesDeFecha, TIPOS_FECHA, type TipoFecha } from "@/lib/logica/fechas";
import { buscarFechas, desconectarCalendario, traerFechas, type Origen, type Propuesta } from "../acciones";

const FUENTES: { id: Origen; nombre: string; detalle: string; inicial: string; color: string; pasos: string[]; ejemplo: string }[] = [
  {
    id: "uv",
    nombre: "Aula Virtual (UV)",
    detalle: "Las fechas que cargan tus profes",
    inicial: "UV",
    color: "bg-acento-claro text-acento-hover",
    pasos: [
      "Entrá a la UV y abrí el Calendario.",
      "Tocá «Exportar calendario».",
      "Elegí «Todos los cursos» y «Próximos 60 días» (o el período más largo que te ofrezca).",
      "Tocá «Obtener URL del calendario» y copiala.",
    ],
    ejemplo: "https://uv.frc.utn.edu.ar/calendar/export…",
  },
  {
    id: "google",
    nombre: "Google Calendar",
    detalle: "Si anotás las fechas en tu Google",
    inicial: "G",
    color: "bg-pizarra text-pizarra-tinta",
    pasos: [
      "Abrí Google Calendar desde la compu.",
      "En Configuración, elegí el calendario de la facu.",
      "Buscá «Dirección secreta en formato iCal» y copiala.",
    ],
    ejemplo: "https://calendar.google.com/calendar/ical/…",
  },
  {
    id: "apple",
    nombre: "Apple Calendar",
    detalle: "Desde iCloud o tu iPhone",
    inicial: "A",
    color: "bg-bloqueo text-tinta",
    pasos: [
      "En el iPhone, abrí Calendario y tocá «Calendarios».",
      "Tocá ⓘ al lado del calendario de la facu.",
      "Activá «Calendario público» y tocá «Compartir enlace».",
    ],
    ejemplo: "webcal://p00-caldav.icloud.com/…",
  },
  {
    id: "outlook",
    nombre: "Outlook",
    detalle: "Si usás el mail de la facu en Outlook",
    inicial: "O",
    color: "bg-arena text-arena-tinta",
    pasos: [
      "En Outlook web, abrí Configuración → Calendario.",
      "Entrá a «Calendarios compartidos» → «Publicar un calendario».",
      "Elegí el calendario y copiá el link ICS.",
    ],
    ejemplo: "https://outlook.office365.com/owa/calendar/…",
  },
];

const campo =
  "h-11 w-full rounded-xl border border-linea bg-superficie px-3 text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro";

type Materia = { id: string; nombre: string; cursando: boolean; aprobada: boolean; grupo: string; orden: number };
type Fila = Propuesta & { elegida: boolean };

export default function ImportarCalendario({
  materias,
  conectado,
}: {
  materias: Materia[];
  conectado: { origen: string; link: string; ultimaBusqueda: string | null; error: string | null } | null;
}) {
  const [paso, setPaso] = useState<"conectar" | "revisar" | "listo">("conectar");
  const [otroLink, setOtroLink] = useState(!conectado);
  const [origen, setOrigen] = useState<Origen>("uv");
  const [link, setLink] = useState("");
  const [filas, setFilas] = useState<Fila[]>([]);
  const [traidas, setTraidas] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [trabajando, iniciar] = useTransition();
  const [confirmarDesconectar, setConfirmarDesconectar] = useState(false);

  const fuente = FUENTES.find((f) => f.id === origen)!;
  const cursando = materias.filter((m) => m.cursando);
  const sinCursando = cursando.length === 0;
  const nombreConectado = FUENTES.find((f) => f.id === conectado?.origen)?.nombre ?? "Tu calendario";

  function buscar(conLinkNuevo: boolean) {
    setError(null);
    iniciar(async () => {
      const r = await buscarFechas(conLinkNuevo ? { origen, link } : undefined);
      if (r.error || !r.propuestas) {
        setError(r.error ?? "No pudimos leer tu calendario.");
        return;
      }
      setFilas(r.propuestas.map((p) => ({ ...p, elegida: p.marcada })));
      setPaso("revisar");
    });
  }

  function cambiar(uid: string, cambios: Partial<Fila>) {
    setFilas((lista) => lista.map((f) => (f.uid === uid ? { ...f, ...cambios } : f)));
  }

  function desconectar() {
    setError(null);
    iniciar(async () => {
      const r = await desconectarCalendario();
      if (r.error) {
        setError(r.error);
        return;
      }
      setConfirmarDesconectar(false);
      setOtroLink(true);
      setLink("");
    });
  }

  const elegidas = filas.filter((f) => f.elegida);
  const sinMateria = elegidas.some((f) => !f.materiaId);

  function traer() {
    setError(null);
    iniciar(async () => {
      const r = await traerFechas(
        elegidas.map((f) => ({ uid: f.uid, titulo: f.titulo, fecha: f.fecha, hora: f.hora, materiaId: f.materiaId!, tipo: f.tipo })),
        filas.filter((f) => !f.elegida).map((f) => f.uid)
      );
      if (r.error) {
        setError(r.error);
        return;
      }
      setTraidas(r.traidas ?? 0);
      setPaso("listo");
    });
  }

  // ---------- Paso 3: listo ----------
  if (paso === "listo") {
    return (
      <section className="flex flex-col gap-3 rounded-3xl bg-acento-claro p-5 text-acento-hover">
        <h2 className="text-lg font-bold">
          {traidas === 0 ? "Listo" : traidas === 1 ? "Trajimos 1 fecha" : `Trajimos ${traidas} fechas`}
        </h2>
        <p className="text-sm">
          {traidas === 0
            ? "No trajiste ninguna fecha. Lo que descartaste no te lo vamos a volver a mostrar."
            : "Ya las ves en el calendario de Inicio y en la pestaña Fechas de cada materia."}
        </p>
        <Link href="/app" className="flex h-12 items-center justify-center rounded-xl bg-acento font-semibold text-white">
          Ver mi calendario
        </Link>
      </section>
    );
  }

  // ---------- Paso 2: revisar ----------
  if (paso === "revisar") {
    return (
      <div className="flex flex-col gap-4 pb-28">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold">
            {filas.length === 0
              ? "No hay fechas nuevas"
              : filas.length === 1
                ? "Encontramos 1 fecha"
                : `Encontramos ${filas.length} fechas`}
          </h2>
          <p className="text-sm text-suave">
            {filas.length === 0
              ? "Ya tenés todo lo de los próximos 4 meses. Volvé a buscar cuando tus profes carguen fechas nuevas."
              : "Tildá las de la facu. Revisá la materia y el tipo que te sugerimos."}
          </p>
        </div>

        {sinCursando && filas.length > 0 && (
          <p className="rounded-2xl bg-arena px-4 py-3 text-sm text-arena-tinta">
            Marcá en{" "}
            <Link href="/app/plan" className="font-semibold underline">
              Plan
            </Link>{" "}
            las materias que estás cursando, así te las mostramos primero.
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {filas.map((f) => {
            const p = partesDeFecha(f.fecha);
            return (
              <li
                key={f.uid}
                className={`flex items-start gap-3 rounded-2xl p-3 ${f.elegida ? "bg-superficie shadow-sm" : "bg-bloqueo text-bloqueo-tinta"}`}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={f.elegida}
                  aria-label={f.elegida ? `No traer ${f.titulo}` : `Traer ${f.titulo}`}
                  onClick={() => cambiar(f.uid, { elegida: !f.elegida })}
                  className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border-2 transition ${
                    f.elegida ? "border-acento bg-acento text-white" : "border-linea bg-superficie"
                  }`}
                >
                  {f.elegida && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  )}
                </button>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex justify-between gap-2">
                    <span className="text-sm font-semibold leading-snug">{f.titulo}</span>
                    <span className="shrink-0 text-xs text-suave">
                      {p.dia.toLowerCase()} {p.numero}/{f.fecha.slice(5, 7)}
                      {f.hora ? ` · ${f.hora}` : ""}
                    </span>
                  </div>
                  {f.elegida ? (
                    <div className="grid grid-cols-[1fr_auto] items-start gap-2">
                      <ElegirMateria
                        fila={f}
                        materias={materias}
                        cursando={cursando}
                        onElegir={(materiaId) => cambiar(f.uid, { materiaId })}
                      />
                      <label className="sr-only" htmlFor={`tipo-${f.uid}`}>
                        Tipo
                      </label>
                      <select
                        id={`tipo-${f.uid}`}
                        value={f.tipo}
                        onChange={(e) => cambiar(f.uid, { tipo: e.target.value as TipoFecha })}
                        className={`${campo} w-auto`}
                      >
                        {(Object.keys(TIPOS_FECHA) as TipoFecha[]).map((t) => (
                          <option key={t} value={t}>
                            {TIPOS_FECHA[t].nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="text-xs">{f.motivo ?? "No se va a traer"}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {error && (
          <p role="alert" className="rounded-xl bg-error-claro px-4 py-3 text-sm text-error">
            {error}
          </p>
        )}

        <div className="fixed inset-x-0 bottom-16 z-10 mx-auto flex max-w-md flex-col gap-1 bg-linear-to-t from-fondo from-70% to-transparent px-5 pb-4 pt-6">
          {sinMateria && <p className="text-center text-xs font-semibold text-error">Elegí la materia de las fechas marcadas en rojo.</p>}
          <button
            type="button"
            disabled={trabajando || sinMateria || filas.length === 0}
            onClick={traer}
            className="h-14 rounded-2xl bg-acento font-semibold text-white transition hover:bg-acento-hover disabled:opacity-50"
          >
            {trabajando
              ? "Guardando…"
              : elegidas.length === 0
                ? "No traer ninguna"
                : elegidas.length === 1
                  ? "Traer 1 fecha"
                  : `Traer ${elegidas.length} fechas`}
          </button>
        </div>
      </div>
    );
  }

  // ---------- Paso 1: conectar ----------
  return (
    <div className="flex flex-col gap-5">
      {conectado && !otroLink ? (
        <section className="flex flex-col gap-3 rounded-3xl bg-superficie p-5 shadow-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-suave">Conectado</span>
            <span className="font-bold">{nombreConectado}</span>
            <span className="text-sm text-suave">{conectado.link}</span>
            {conectado.ultimaBusqueda && (
              <span className="text-sm text-suave">Última búsqueda: {conectado.ultimaBusqueda}</span>
            )}
          </div>

          {conectado.error && (
            <p className="rounded-xl bg-error-claro px-4 py-3 text-sm text-error">
              {conectado.error} Si el link cambió, tocá «Usar otro link» y pegá el nuevo.
            </p>
          )}

          <button
            type="button"
            disabled={trabajando}
            onClick={() => buscar(false)}
            className="h-14 rounded-2xl bg-acento font-semibold text-white transition hover:bg-acento-hover disabled:opacity-50"
          >
            {trabajando ? "Buscando…" : "Buscar fechas nuevas"}
          </button>
          <p className="text-xs leading-relaxed text-suave">
            Solo te mostramos las fechas que todavía no trajiste ni descartaste.
          </p>

          <div className="flex items-center justify-between gap-3 border-t border-fondo pt-3">
            <button type="button" onClick={() => setOtroLink(true)} className="text-sm font-semibold text-acento hover:underline">
              Usar otro link
            </button>
            {!confirmarDesconectar && (
              <button
                type="button"
                onClick={() => setConfirmarDesconectar(true)}
                className="text-sm font-semibold text-error hover:underline"
              >
                Desconectar
              </button>
            )}
          </div>

          {confirmarDesconectar && (
            <div className="flex flex-col gap-3 rounded-2xl bg-error-claro p-4 text-sm text-error">
              <p>
                Vamos a borrar el link guardado. Las fechas que ya trajiste <strong>se quedan</strong> en Agendu.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmarDesconectar(false)}
                  className="h-11 rounded-xl border border-linea bg-superficie font-semibold text-tinta"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={trabajando}
                  onClick={desconectar}
                  className="h-11 rounded-xl bg-error font-semibold text-white disabled:opacity-50"
                >
                  {trabajando ? "Desconectando…" : "Desconectar"}
                </button>
              </div>
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-suave">¿De dónde?</h2>
            {FUENTES.map((f) => {
              const activa = f.id === origen;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={activa}
                  onClick={() => setOrigen(f.id)}
                  className={`flex items-center gap-3 rounded-2xl border-2 bg-superficie p-3 text-left transition ${
                    activa ? "border-acento" : "border-transparent shadow-sm"
                  }`}
                >
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${f.color}`}>
                    {f.inicial}
                  </span>
                  <span className="flex flex-1 flex-col">
                    <span className="font-bold">{f.nombre}</span>
                    <span className="text-xs text-suave">{f.detalle}</span>
                  </span>
                  {f.id === "uv" && (
                    <span className="rounded-full bg-acento-claro px-2 py-0.5 text-[11px] font-bold text-acento-hover">Recomendado</span>
                  )}
                </button>
              );
            })}
          </section>

          <section className="flex flex-col gap-3 rounded-3xl bg-superficie p-5 shadow-sm">
            <h2 className="font-bold">Cómo copiar el link</h2>
            <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed">
              {fuente.pasos.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ol>
            <label htmlFor="link" className="pt-1 text-sm font-semibold">
              Pegá el link acá
            </label>
            <input
              id="link"
              type="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder={fuente.ejemplo}
              className={campo}
            />
            <button
              type="button"
              disabled={trabajando || !link.trim()}
              onClick={() => buscar(true)}
              className="h-14 rounded-2xl bg-acento font-semibold text-white transition hover:bg-acento-hover disabled:opacity-50"
            >
              {trabajando ? "Leyendo tu calendario…" : "Buscar fechas"}
            </button>
            <p className="text-xs leading-relaxed text-suave">
              El link es privado: lo guardamos solo para vos y podés desconectarlo cuando quieras. Ninguna fecha entra a
              Agendu sin que la elijas.
            </p>
            {conectado && (
              <button type="button" onClick={() => setOtroLink(false)} className="self-start text-sm font-semibold text-acento hover:underline">
                ← Seguir con el que tenía
              </button>
            )}
          </section>
        </>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-error-claro px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

// El desplegable de materia de cada fecha: arriba las que cursás; después, el resto separado por año,
// en el orden del plan (como en la pantalla Plan), y las electivas al final. Las aprobadas no aparecen.
function ElegirMateria({
  fila,
  materias,
  cursando,
  onElegir,
}: {
  fila: Fila;
  materias: Materia[];
  cursando: Materia[];
  onElegir: (materiaId: string | null) => void;
}) {
  const id = `materia-${fila.uid}`;

  // Las materias ya vienen en el orden del plan; solo pasamos las electivas al final (el orden es estable).
  // Una aprobada se muestra solo si es la que está elegida, para que el desplegable no quede vacío.
  const resto = materias
    .filter((m) => !m.cursando && (!m.aprobada || m.id === fila.materiaId))
    .sort((a, b) => a.orden - b.orden);
  const grupos: { titulo: string; materias: Materia[] }[] = [];
  for (const m of resto) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo?.titulo === m.grupo) ultimo.materias.push(m);
    else grupos.push({ titulo: m.grupo, materias: [m] });
  }

  return (
    <>
      <label className="sr-only" htmlFor={id}>
        Materia
      </label>
      <select
        id={id}
        value={fila.materiaId ?? ""}
        onChange={(e) => onElegir(e.target.value || null)}
        className={`${campo} ${fila.materiaId ? "" : "border-error text-error"}`}
      >
        <option value="">Elegí la materia</option>
        {cursando.length > 0 && (
          <optgroup label="Las que cursás">
            {cursando.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </optgroup>
        )}
        {grupos.map((g) => (
          <optgroup key={g.titulo} label={g.titulo}>
            {g.materias.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </>
  );
}