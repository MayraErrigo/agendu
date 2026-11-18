// Reglas de los archivos: qué tipos se aceptan, cómo se reconocen y cómo se muestran los tamaños.
// Funciones puras: no leen la base ni la pantalla, así se pueden probar solas.

export const MAXIMO_POR_VEZ = 10;

// Los tipos permitidos. "abrir": se ve en el navegador; si no, se descarga.
export const TIPOS = {
  pdf: { mime: "application/pdf", etiqueta: "PDF", abrir: true },
  jpg: { mime: "image/jpeg", etiqueta: "Foto", abrir: true },
  png: { mime: "image/png", etiqueta: "Imagen", abrir: true },
  heic: { mime: "image/heic", etiqueta: "Foto", abrir: false },
  docx: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", etiqueta: "Word", abrir: false },
  xlsx: { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", etiqueta: "Excel", abrir: false },
  pptx: { mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", etiqueta: "PowerPoint", abrir: false },
} as const;

export type Extension = keyof typeof TIPOS;

// Lo que acepta el selector de archivos del celular o la compu.
export const ACEPTA = ".pdf,.jpg,.jpeg,.png,.heic,.docx,.xlsx,.pptx";

// Formatos que la gente suele tener y por qué no van.
const RECHAZADOS: Record<string, string> = {
  doc: "Guardalo como .docx y probá de nuevo.",
  xls: "Guardalo como .xlsx y probá de nuevo.",
  ppt: "Guardalo como .pptx y probá de nuevo.",
  docm: "Los archivos con macros no se pueden subir. Guardalo como .docx.",
  xlsm: "Los archivos con macros no se pueden subir. Guardalo como .xlsx.",
  pptm: "Los archivos con macros no se pueden subir. Guardalo como .pptx.",
};

// "Resumen Unidad 2.PDF" → "pdf". "foto.jpeg" → "jpg". Si no se acepta, devuelve el motivo.
export function extensionDe(nombreArchivo: string): { extension: Extension } | { error: string } {
  const partes = nombreArchivo.toLowerCase().split(".");
  const ext = partes.length > 1 ? partes.pop()! : "";
  const normal = ext === "jpeg" ? "jpg" : ext === "heif" ? "heic" : ext;
  if (normal in TIPOS) return { extension: normal as Extension };
  if (RECHAZADOS[normal]) return { error: `Este formato no se puede subir. ${RECHAZADOS[normal]}` };
  return { error: "Este tipo de archivo no se puede subir. Se aceptan PDF, fotos, Word, Excel y PowerPoint." };
}

// El nombre sin la extensión, para mostrarlo: "Resumen Unidad 2.pdf" → "Resumen Unidad 2".
export function nombreSinExtension(nombreArchivo: string): string {
  const punto = nombreArchivo.lastIndexOf(".");
  const base = (punto > 0 ? nombreArchivo.slice(0, punto) : nombreArchivo).trim();
  return (base || "Archivo").slice(0, 120);
}

// La "huella" de cada tipo: los primeros bytes de un archivo real.
// Sirve para detectar un archivo con la extensión cambiada (por ejemplo, un programa renombrado a .pdf).
export function coincideFirma(extension: Extension, bytes: Uint8Array): boolean {
  const empieza = (...firma: number[]) => firma.every((b, i) => bytes[i] === b);
  switch (extension) {
    case "pdf":
      return empieza(0x25, 0x50, 0x44, 0x46); // %PDF
    case "png":
      return empieza(0x89, 0x50, 0x4e, 0x47); // .PNG
    case "jpg":
      return empieza(0xff, 0xd8, 0xff);
    case "heic":
      return bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70; // ....ftyp
    case "docx":
    case "xlsx":
    case "pptx":
      return empieza(0x50, 0x4b, 0x03, 0x04); // PK (son archivos zip por dentro)
  }
}

// 1536 → "2 KB"; 52428800 → "50 MB".
export function formatearTamano(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toLocaleString("es-AR", { maximumFractionDigits: mb >= 10 ? 0 : 1 })} MB`;
  const kb = Math.max(1, Math.round(bytes / 1024));
  return `${kb} KB`;
}