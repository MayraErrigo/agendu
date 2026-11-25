"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS_PPS, type EstadoPps } from "@/lib/logica/pps";

// Cambia en qué está el alumno con su Práctica Profesional Supervisada (tarjeta de Inicio).
export async function cambiarEstadoPps(estado: EstadoPps): Promise<{ error: string } | null> {
  if (!ESTADOS_PPS.includes(estado)) {
    return { error: "Ese estado no existe." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Tu sesión se cerró. Volvé a iniciar sesión." };
  }

  const { error } = await supabase.from("perfiles").update({ pps_estado: estado }).eq("id", user.id);
  if (error) {
    return { error: "No pudimos guardarlo. Probá de nuevo." };
  }

  revalidatePath("/app");
  return null;
}