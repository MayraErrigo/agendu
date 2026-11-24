// Archivos repetidos: antes de subir, se compara con los que ya hay en la misma carpeta.
// Mismo nombre (sin importar mayúsculas) y mismo tamaño → es el mismo archivo.
// Mismo nombre y otro tamaño → probablemente una versión nueva.
// Funciones puras: se pueden probar solas.

export type Existente = { id: string; nombre: string; extension: string; tamano: number };
export type Repetido = { tipo: "igual" | "nombre"; id: string; nombreLibre: string };

const clave = (nombre: string, extension: string) => `${nombre.trim().toLowerCase()}.${extension.toLowerCase()}`;

// Un nombre que no esté usado en la carpeta: "Apunte" → "Apunte (2).pdf", "Apunte (3).pdf"…
export function nombreLibre(base: string, extension: string, existentes: Existente[]): string {
  const usados = new Set(existentes.map((e) => clave(e.nombre, e.extension)));
  for (let n = 2; n < 1000; n++) {
    const candidato = `${base} (${n})`;
    if (!usados.has(clave(candidato, extension))) return `${candidato}.${extension}`;
  }
  return `${base} (${Date.now()}).${extension}`;
}

// ¿El archivo (nombre sin extensión + extensión) ya está en la carpeta? Devuelve null si no se repite.
export function buscarRepetido(base: string, extension: string, tamano: number, existentes: Existente[]): Repetido | null {
  const mismos = existentes.filter((e) => clave(e.nombre, e.extension) === clave(base, extension));
  if (!mismos.length) return null;
  const igual = mismos.find((e) => Number(e.tamano) === tamano);
  return {
    tipo: igual ? "igual" : "nombre",
    id: (igual ?? mismos[0]).id,
    nombreLibre: nombreLibre(base, extension, existentes),
  };
}