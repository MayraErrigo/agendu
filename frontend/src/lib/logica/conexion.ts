// El estado del calendario conectado (UV, Google, Apple u Outlook): hace cuánto se buscó y si hay que avisar.
// Funciones puras: no leen la base ni la pantalla, así se pueden probar solas.

export const DIAS_AVISO = 14; // después de esto, le recordamos buscar fechas nuevas

export const NOMBRE_ORIGEN: Record<string, string> = {
  uv: "UV",
  google: "Google Calendar",
  apple: "Apple Calendar",
  outlook: "Outlook",
};

export type ConexionCalendario = {
  origen: string;
  ultimaBusqueda: string | null; // fecha y hora (ISO) de la última búsqueda
  conError: boolean; // el link dejó de funcionar en la última búsqueda
};

export type EstadoConexion =
  | { nivel: "error"; nombre: string }
  | { nivel: "aviso"; nombre: string; dias: number | null }
  | { nivel: "ok"; nombre: string; dias: number };

// Días entre una fecha y hora (ISO, en cualquier zona) y hoy (AAAA-MM-DD, en Argentina).
export function diasDesde(instante: string, hoy: string): number {
  const ms = new Date(instante).getTime();
  if (Number.isNaN(ms)) return 0;
  const enArgentina = new Date(ms - 3 * 3600_000).toISOString().slice(0, 10); // Argentina: UTC-3, sin horario de verano
  const [a1, m1, d1] = enArgentina.split("-").map(Number);
  const [a2, m2, d2] = hoy.split("-").map(Number);
  const dias = Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86_400_000);
  return Math.max(0, dias);
}

// "hoy", "ayer" o "hace 5 días".
export function haceCuanto(dias: number): string {
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  return `hace ${dias} días`;
}

// Qué mostrar: rojo si el link falla, dorado si hace mucho que no busca, normal si está al día.
export function estadoConexion(conexion: ConexionCalendario, hoy: string): EstadoConexion {
  const nombre = NOMBRE_ORIGEN[conexion.origen] ?? "Tu calendario";
  if (conexion.conError) return { nivel: "error", nombre };
  if (!conexion.ultimaBusqueda) return { nivel: "aviso", nombre, dias: null };
  const dias = diasDesde(conexion.ultimaBusqueda, hoy);
  return dias >= DIAS_AVISO ? { nivel: "aviso", nombre, dias } : { nivel: "ok", nombre, dias };
}