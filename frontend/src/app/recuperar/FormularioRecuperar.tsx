"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

// Pedir un link para elegir una contraseña nueva.
export default function FormularioRecuperar() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/nueva-contrasena`,
    });
    setEnviando(false);
    // Solo avisamos si hay que esperar. En cualquier otro caso, el mismo mensaje exista o no la cuenta,
    // así nadie puede usar esta pantalla para averiguar quién está registrado.
    if (error && error.message.toLowerCase().includes("rate limit")) {
      setError("Pediste muchos links seguidos. Esperá unos minutos y probá de nuevo.");
      return;
    }
    setEnviado(true);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-10 pt-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <Logo tamano={56} conNombre />
        <h1 className="mt-6 text-[26px] font-bold leading-tight tracking-tight">¿Olvidaste tu contraseña?</h1>
        <p className="text-suave">Escribí tu mail y te mandamos un link para elegir una nueva.</p>
      </div>

      {enviado ? (
        <div className="mt-10 flex flex-col gap-3 rounded-3xl bg-acento-claro p-5 text-acento-hover">
          <p className="font-bold">Revisá tu mail</p>
          <p className="text-sm">
            Si hay una cuenta con <strong>{email.trim()}</strong>, te mandamos un link. Abrilo desde este mismo navegador.
            Vence en una hora.
          </p>
          <p className="text-sm">Si no te llega en unos minutos, fijate en la carpeta de spam.</p>
        </div>
      ) : (
        <form onSubmit={enviar} className="mt-10 flex flex-col gap-3">
          <label htmlFor="email" className="text-sm font-semibold">
            Mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-13 rounded-2xl border border-linea bg-superficie px-4 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro"
          />
          {error && (
            <p role="alert" className="rounded-xl bg-error-claro px-4 py-3 text-sm text-error">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={enviando}
            className="mt-2 h-14 rounded-2xl bg-acento font-semibold text-white transition hover:bg-acento-hover disabled:opacity-60"
          >
            {enviando ? "Enviando…" : "Enviar link"}
          </button>
        </form>
      )}

      <Link href="/login" className="mt-6 text-center text-[15px] font-semibold text-acento hover:underline">
        ← Volver a iniciar sesión
      </Link>
    </main>
  );
}