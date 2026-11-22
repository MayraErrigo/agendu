// Lectura de calendarios en formato iCalendar (.ics): el que usan la UV (Moodle), Google, Apple y Outlook.
// Funciones puras: no leen la base ni internet, así se pueden probar solas.

import type { TipoFecha } from "@/lib/logica/fechas";

export type EventoCalendario = {
  uid: string;
  titulo: string;
  categoria: string; // en la UV, el curso (por ejemplo "Análisis Numérico - 3K1")
  fecha: string; // AAAA-MM-DD, en hora de Argentina
  hora: string | null; // HH:MM, o null si es de día completo
};

const ARGENTINA_HORAS = -3; // Argentina no tiene horario de verano

// Une las líneas partidas (en .ics, una línea que empieza con espacio continúa la anterior).
function desplegar(texto: string): string[] {
  return texto.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n");
}

// Saca las barras de escape del texto: "\\," → ","
function limpiarTexto(valor: string): string {
  return valor
    .replace(/\\n/gi, " ")
    .replace(/\\([,;\\])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

// "20261124", "20261124T180000" o "20261124T210000Z" → fecha y hora en Argentina.
export function leerFechaIcs(valor: string, esUtc: boolean): { fecha: string; hora: string | null } | null {
  const m = valor.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?(Z)?$/);
  if (!m) return null;
  const [, a, mes, d, h, min, , z] = m;
  if (!h) return { fecha: `${a}-${mes}-${d}`, hora: null };
  if (z || esUtc) {
    const utc = new Date(Date.UTC(+a, +mes - 1, +d, +h, +min));
    const local = new Date(utc.getTime() + ARGENTINA_HORAS * 3600_000);
    const iso = local.toISOString();
    return { fecha: iso.slice(0, 10), hora: iso.slice(11, 16) };
  }
  return { fecha: `${a}-${mes}-${d}`, hora: `${h}:${min}` };
}

// Lee los eventos de un calendario. Lo que no se entiende, se saltea.
export function leerIcs(texto: string, maximo = 1000): EventoCalendario[] {
  const eventos: EventoCalendario[] = [];
  let actual: Partial<EventoCalendario> | null = null;

  for (const linea of desplegar(texto)) {
    if (linea === "BEGIN:VEVENT") {
      actual = {};
      continue;
    }
    if (linea === "END:VEVENT") {
      if (actual?.uid && actual.titulo && actual.fecha) {
        eventos.push({
          uid: actual.uid.slice(0, 500),
          titulo: actual.titulo.slice(0, 120),
          categoria: (actual.categoria ?? "").slice(0, 200),
          fecha: actual.fecha,
          hora: actual.hora ?? null,
        });
        if (eventos.length >= maximo) break;
      }
      actual = null;
      continue;
    }
    if (!actual) continue;

    const dosPuntos = linea.indexOf(":");
    if (dosPuntos < 0) continue;
    const nombre = linea.slice(0, dosPuntos);
    const valor = linea.slice(dosPuntos + 1);
    const clave = nombre.split(";")[0].toUpperCase();

    if (clave === "UID") actual.uid = valor.trim();
    else if (clave === "SUMMARY") actual.titulo = limpiarTexto(valor);
    else if (clave === "CATEGORIES") actual.categoria = limpiarTexto(valor);
    else if (clave === "DTSTART") {
      const leida = leerFechaIcs(valor.trim(), false);
      if (leida) {
        actual.fecha = leida.fecha;
        actual.hora = leida.hora;
      }
    }
  }
  return eventos;
}

// Saca tildes, mayúsculas y signos, para comparar textos.
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// En Moodle, los cuestionarios tienen un evento "abre" y otro "cierra". El que importa es el cierre.
export function esApertura(titulo: string): boolean {
  const t = normalizar(titulo);
  return /\b(abre|se abre|opens|apertura|comienza|inicio)$/.test(t);
}

// El tipo de fecha según las palabras del título.
export function sugerirTipo(titulo: string): TipoFecha {
  const t = normalizar(titulo);
  if (/\b(parcial|cuestionario|evaluacion|examen|coloquio|integrador|integradora|quiz|test)\b/.test(t)) return "evaluacion";
  if (/\b(tp|tps|trabajo practico|entrega|tarea|vence|informe|assignment|due)\b/.test(t)) return "entrega";
  if (/\b(leccion|oral)\b/.test(t)) return "leccion";
  if (/\b(presentacion|exposicion|defensa)\b/.test(t)) return "presentacion";
  return "otro";
}

// La materia que corresponde, buscando su nombre en el curso o el título. Si hay varias, la de nombre más largo
// ("Análisis Matemático II" le gana a "Análisis Matemático I").
export function sugerirMateria(texto: string, materias: { id: string; nombre: string }[]): string | null {
  const t = ` ${normalizar(texto)} `;
  let mejor: { id: string; largo: number } | null = null;
  for (const m of materias) {
    const n = normalizar(m.nombre);
    if (n.length < 4) continue;
    if (t.includes(` ${n} `) && (!mejor || n.length > mejor.largo)) mejor = { id: m.id, largo: n.length };
  }
  return mejor?.id ?? null;
}