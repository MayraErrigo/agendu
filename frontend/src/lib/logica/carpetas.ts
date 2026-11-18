// Las carpetas de Archivos. Las fijas son iguales en todas las materias y no se guardan en la base.

export const MAXIMO_PROPIAS = 5;

export const CARPETAS_FIJAS = [
  { id: "apuntes", nombre: "Apuntes" },
  { id: "resumenes", nombre: "Resúmenes" },
  { id: "parciales", nombre: "Parciales viejos" },
  { id: "practicas", nombre: "Prácticas" },
  { id: "otros", nombre: "Otros" },
] as const;

export type Carpeta = { id: string; nombre: string; fija: boolean };

export function esCarpetaFija(id: string): boolean {
  return CARPETAS_FIJAS.some((c) => c.id === id);
}

// El nombre ya está en uso (sin importar mayúsculas ni espacios de más)?
export function nombreRepetido(nombre: string, carpetas: { id: string; nombre: string }[], salvo?: string): boolean {
  const normal = (t: string) => t.trim().toLocaleLowerCase("es");
  return carpetas.some((c) => c.id !== salvo && normal(c.nombre) === normal(nombre));
}