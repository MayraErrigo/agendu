// Revisión de los links de calendario que pegan los alumnos, antes de que el servidor los lea.
// Seguridad: solo links públicos de internet, cifrados (https), nunca direcciones internas.
// Funciones puras: se pueden probar solas.

// ¿Es una dirección IP de una red privada, local o reservada?
export function esIpPrivada(ip: string): boolean {
  const v4 = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith("::ffff:")) return esIpPrivada(v6.slice(7));
  return v6 === "::" || v6 === "::1" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80");
}

// Revisa y normaliza el link: webcal:// pasa a https://. Devuelve el motivo si no se acepta.
export function revisarLink(texto: string): { url: URL } | { error: string } {
  const limpio = texto.trim().replace(/^webcals?:\/\//i, "https://");
  if (!limpio) return { error: "Pegá el link de tu calendario." };
  if (limpio.length > 2000) return { error: "El link es demasiado largo." };

  let url: URL;
  try {
    url = new URL(limpio);
  } catch {
    return { error: "Eso no parece un link. Copialo de nuevo." };
  }
  if (url.protocol !== "https:") return { error: "El link tiene que empezar con https:// o webcal://." };
  if (url.username || url.password) return { error: "Ese link no se puede usar." };
  if (url.port && url.port !== "443") return { error: "Ese link no se puede usar." };

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  // Nada de direcciones IP sueltas ni nombres internos: solo dominios públicos.
  if (/^[\d.]+$/.test(host) || host.includes(":")) return { error: "Ese link no se puede usar." };
  if (!host.includes(".") || /(^|\.)(localhost|local|internal|intranet|lan|home|corp)$/.test(host)) {
    return { error: "Ese link no se puede usar." };
  }
  return { url };
}

// Lo que se muestra del link en pantalla: solo el comienzo, nunca entero (puede tener una clave).
export function linkOculto(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}/…`;
  } catch {
    return "link guardado";
  }
}