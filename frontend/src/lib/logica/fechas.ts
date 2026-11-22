// Las fechas importantes de una materia: tipos, colores y cómo se muestran.
// Funciones puras: no leen la base ni la pantalla, así se pueden probar solas.

export const TIPOS_FECHA = {
  entrega: { nombre: "Entrega", chip: "bg-arena text-arena-tinta", ejemplo: "Ej.: Entrega del TP 4" },
  leccion: { nombre: "Lección", chip: "bg-pizarra text-pizarra-tinta", ejemplo: "Ej.: Lección oral, unidad 3" },
  evaluacion: { nombre: "Evaluación", chip: "bg-error-claro text-error", ejemplo: "Ej.: Prueba integradora" },
  presentacion: { nombre: "Presentación", chip: "bg-pizarra text-pizarra-tinta", ejemplo: "Ej.: Exposición del grupo" },
  otro: { nombre: "Otro", chip: "bg-bloqueo text-bloqueo-tinta", ejemplo: "Ej.: Clase de consulta" },
} as const;

export type TipoFecha = keyof typeof TIPOS_FECHA;

export function esTipoFecha(valor: string): valor is TipoFecha {
  return valor in TIPOS_FECHA;
}

// La fecha de hoy en Argentina, como "AAAA-MM-DD" (el servidor puede estar en otra zona horaria).
export function hoyEnArgentina(ahora: Date = new Date()): string {
  return ahora.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
}

// "2026-11-24" → { dia: "MAR", numero: 24, mes: "nov" }
export function partesDeFecha(fecha: string): { dia: string; numero: number; mes: string } {
  const [a, m, d] = fecha.split("-").map(Number);
  const dias = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const diaSemana = new Date(Date.UTC(a, m - 1, d)).getUTCDay();
  return { dia: dias[diaSemana], numero: d, mes: meses[m - 1] };
}

// "18:30:00" → "18:30"
export function horaCorta(hora: string | null): string | null {
  return hora ? hora.slice(0, 5) : null;
}

export type ItemFecha = {
  id: string;
  tipo: TipoFecha | "parcial";
  titulo: string;
  fecha: string; // AAAA-MM-DD
  hora: string | null; // HH:MM
  origen: "manual" | "uv" | "calendario" | "parciales";
};

// Ordena de la más próxima a la más lejana y separa las que ya pasaron.
export function separarPorFecha(items: ItemFecha[], hoy: string): { proximas: ItemFecha[]; pasadas: ItemFecha[] } {
  const clave = (i: ItemFecha) => `${i.fecha} ${i.hora ?? "99:99"}`;
  const ordenadas = [...items].sort((x, y) => clave(x).localeCompare(clave(y)));
  return {
    proximas: ordenadas.filter((i) => i.fecha >= hoy),
    pasadas: ordenadas.filter((i) => i.fecha < hoy).reverse(),
  };
}