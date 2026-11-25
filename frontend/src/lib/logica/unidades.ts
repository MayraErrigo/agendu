// Cómo se cuentan las electivas de cada plan: en créditos (Sistemas, Química, Industrial)
// o en horas (Civil, Mecánica). Algunas tienen medios: 1,5 horas.
// Funciones puras: no leen la base ni la pantalla, así se pueden probar solas.

export type Unidad = "creditos" | "horas";

// Lo que venga de la base: si no dice "horas", son créditos.
export function unidadDe(valor: unknown): Unidad {
  return valor === "horas" ? "horas" : "creditos";
}

// 1.5 → "1,5"; 2 → "2".
export function numero(n: number): string {
  return n.toLocaleString("es-AR", { maximumFractionDigits: 1 });
}

// 1 → "1 crédito"; 1.5 → "1,5 horas".
export function cantidad(n: number, unidad: Unidad): string {
  const palabra = unidad === "horas" ? (n === 1 ? "hora" : "horas") : n === 1 ? "crédito" : "créditos";
  return `${numero(n)} ${palabra}`;
}

// Para títulos y etiquetas: "Créditos" u "Horas".
export function nombreUnidad(unidad: Unidad): string {
  return unidad === "horas" ? "Horas" : "Créditos";
}

// Lo que escribe el alumno ("2", "1,5" o "1.5"). Acepta de 0,5 a 20, de medio en medio.
export function leerCantidad(texto: string): number | null {
  const limpio = texto.trim().replace(",", ".");
  if (!/^\d{1,2}(\.\d)?$/.test(limpio)) return null;
  const n = Number(limpio);
  if (n < 0.5 || n > 20 || !Number.isInteger(n * 2)) return null;
  return n;
}