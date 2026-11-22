import { createClient } from "@/lib/supabase/server";
import type { ConexionCalendario } from "@/lib/logica/conexion";

// El calendario conectado del alumno, sin el link (el link no sale nunca del servidor).
export async function obtenerConexion(usuarioId: string): Promise<ConexionCalendario | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("conexiones_calendario")
    .select("origen, ultima_busqueda, ultimo_error")
    .eq("usuario_id", usuarioId)
    .maybeSingle();
  if (!data) return null;
  return {
    origen: data.origen as string,
    ultimaBusqueda: (data.ultima_busqueda as string | null) ?? null,
    conError: Boolean(data.ultimo_error),
  };
}