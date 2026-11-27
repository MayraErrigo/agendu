"use server";

import { randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

export type ResultadoArrepentimiento = { error: string } | { codigo: string } | null;

const LETRAS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O ni 1/I, para que no se confundan

// Código de trámite, por ejemplo ARR-7K2M9QXA.
function nuevoCodigo(): string {
  const bytes = randomBytes(8);
  return "ARR-" + Array.from(bytes, (b) => LETRAS[b % LETRAS.length]).join("");
}

// Guarda un pedido de arrepentimiento. No hace falta iniciar sesión.
export async function pedirArrepentimiento(
  _anterior: ResultadoArrepentimiento,
  formulario: FormData
): Promise<ResultadoArrepentimiento> {
  // Campo trampa: las personas no lo ven; si viene completo, es un robot.
  if (String(formulario.get("sitio") ?? "")) return { error: "No pudimos registrar el pedido." };

  const email = String(formulario.get("email") ?? "").trim().toLowerCase();
  const motivo = String(formulario.get("motivo") ?? "").trim();
  if (email.length < 5 || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Escribí el mail con el que te suscribiste." };
  }
  if (motivo.length > 1000) return { error: "El motivo puede tener hasta 1000 caracteres." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si justo se repite un código (casi imposible), se prueba con otro.
  for (let intento = 0; intento < 3; intento++) {
    const codigo = nuevoCodigo();
    const { error } = await supabase.from("arrepentimientos").insert({
      codigo,
      email,
      motivo: motivo || null,
      usuario_id: user?.id ?? null,
    });
    if (!error) return { codigo };
    if (!error.message.includes("duplicate")) break;
  }
  return { error: "No pudimos registrar el pedido. Probá de nuevo o escribinos por mail." };
}