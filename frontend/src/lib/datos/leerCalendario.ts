import { lookup } from "node:dns/promises";
import { esIpPrivada, revisarLink } from "@/lib/logica/links";

const TIEMPO_MAXIMO = 15_000; // 15 segundos
const TAMANO_MAXIMO = 2 * 1024 * 1024; // 2 MB
const REDIRECCIONES_MAXIMAS = 3;

// Descarga el texto de un calendario con todas las precauciones:
// solo https públicos, nunca direcciones internas (ni después de una redirección),
// con tiempo y tamaño máximos. Devuelve el texto o el motivo del error.
export async function descargarCalendario(link: string): Promise<{ texto: string } | { error: string }> {
  let revisado = revisarLink(link);
  if ("error" in revisado) return revisado;
  const limite = AbortSignal.timeout(TIEMPO_MAXIMO);

  try {
    for (let salto = 0; salto <= REDIRECCIONES_MAXIMAS; salto++) {
      const url = revisado.url;

      // El nombre tiene que apuntar a direcciones públicas (evita que alguien use a Agendu para entrar a redes internas).
      const direcciones = await lookup(url.hostname, { all: true });
      if (!direcciones.length || direcciones.some((d) => esIpPrivada(d.address))) {
        return { error: "Ese link no se puede usar." };
      }

      const respuesta = await fetch(url, {
        redirect: "manual",
        signal: limite,
        cache: "no-store",
        headers: { Accept: "text/calendar, text/plain;q=0.9, */*;q=0.1", "User-Agent": "Agendu/1.0 (calendario)" },
      });

      // Redirección: se revisa el nuevo destino con las mismas reglas.
      if (respuesta.status >= 300 && respuesta.status < 400) {
        const destino = respuesta.headers.get("location");
        if (!destino) return { error: "No pudimos leer ese calendario." };
        revisado = revisarLink(new URL(destino, url).toString());
        if ("error" in revisado) return revisado;
        continue;
      }

      if (respuesta.status === 401 || respuesta.status === 403 || respuesta.status === 404) {
        return { error: "El link no funciona o ya no es válido. Copialo de nuevo." };
      }
      if (!respuesta.ok || !respuesta.body) return { error: "No pudimos leer ese calendario. Probá de nuevo más tarde." };

      const declarado = Number(respuesta.headers.get("content-length") ?? 0);
      if (declarado > TAMANO_MAXIMO) return { error: "Ese calendario es demasiado grande." };

      // Leemos de a partes y cortamos si pasa el máximo.
      const lector = respuesta.body.getReader();
      const partes: Uint8Array[] = [];
      let total = 0;
      for (;;) {
        const { done, value } = await lector.read();
        if (done) break;
        total += value.byteLength;
        if (total > TAMANO_MAXIMO) {
          await lector.cancel();
          return { error: "Ese calendario es demasiado grande." };
        }
        partes.push(value);
      }
      const texto = new TextDecoder("utf-8").decode(Buffer.concat(partes));
      if (!texto.includes("BEGIN:VCALENDAR")) {
        return { error: "Ese link no es de un calendario. Revisá que hayas copiado el link correcto." };
      }
      return { texto };
    }
    return { error: "No pudimos leer ese calendario." };
  } catch {
    return { error: "El calendario tardó demasiado o no se pudo abrir. Probá de nuevo." };
  }
}