// Cuentas de fechas para el calendario de Inicio. Todo con fechas "AAAA-MM-DD", sin horas ni zonas horarias.
// Funciones puras: no leen la base ni la pantalla, así se pueden probar solas.

function aFecha(texto: string): Date {
  const [a, m, d] = texto.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}

function aTexto(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

// "2026-11-30" + 3 → "2026-12-03"
export function sumarDias(fecha: string, dias: number): string {
  const f = aFecha(fecha);
  f.setUTCDate(f.getUTCDate() + dias);
  return aTexto(f);
}

// El lunes de la semana de esa fecha.
export function inicioDeSemana(fecha: string): string {
  const diaSemana = (aFecha(fecha).getUTCDay() + 6) % 7; // lunes = 0 … domingo = 6
  return sumarDias(fecha, -diaSemana);
}

// Los 7 días de la semana (de lunes a domingo) que contiene esa fecha.
export function diasDeSemana(fecha: string): string[] {
  const lunes = inicioDeSemana(fecha);
  return Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
}

// Los días de un mes para una grilla que empieza en lunes. Los huecos del principio son null.
export function grillaDelMes(anio: number, mes: number): (string | null)[] {
  const primero = `${anio}-${String(mes).padStart(2, "0")}-01`;
  const huecos = (aFecha(primero).getUTCDay() + 6) % 7;
  const cantidad = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  return [...Array(huecos).fill(null), ...Array.from({ length: cantidad }, (_, i) => sumarDias(primero, i))];
}

// Mes siguiente o anterior: (2026, 12, +1) → { anio: 2027, mes: 1 }
export function moverMes(anio: number, mes: number, cuanto: number): { anio: number; mes: number } {
  const total = anio * 12 + (mes - 1) + cuanto;
  return { anio: Math.floor(total / 12), mes: (total % 12) + 1 };
}

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function nombreDelMes(anio: number, mes: number): string {
  return `${MESES[mes - 1]} ${anio}`;
}

// "2026-11-26" → "Jueves 26"
export function nombreDelDia(fecha: string): string {
  const f = aFecha(fecha);
  return `${DIAS[f.getUTCDay()]} ${f.getUTCDate()}`;
}