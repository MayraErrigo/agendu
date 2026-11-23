import { apareceEnLista } from "@/lib/logica/contrasena";

// ¿La contraseña apareció en filtraciones de datos conocidas? Consulta el servicio público
// Have I Been Pwned (Pwned Passwords) sin mandar la contraseña: se calcula su huella SHA-1
// en el navegador y se envían solo los primeros 5 caracteres; la comparación se hace acá.
// Devuelve true / false, o null si no se pudo consultar (en ese caso no bloqueamos a nadie).
export async function estaFiltrada(contrasena: string): Promise<boolean | null> {
  try {
    const bytes = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(contrasena));
    const huella = Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
    const respuesta = await fetch(`https://api.pwnedpasswords.com/range/${huella.slice(0, 5)}`, {
      headers: { "Add-Padding": "true" },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!respuesta.ok) return null;
    return apareceEnLista(huella.slice(5), await respuesta.text());
  } catch {
    return null;
  }
}