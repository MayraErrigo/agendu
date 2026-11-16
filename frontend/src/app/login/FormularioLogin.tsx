"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

type Mensaje = { tipo: "error" | "ok"; texto: string } | null;

// Pasa los errores de Supabase (en inglés) a mensajes claros en castellano.
function traducirError(mensaje: string) {
  const m = mensaje.toLowerCase();
  if (m.includes("invalid login credentials")) return "El mail o la contraseña no coinciden.";
  if (m.includes("email not confirmed")) return "Todavía no confirmaste tu mail. Revisá tu casilla (y la carpeta de spam).";
  if (m.includes("already registered")) return "Ya hay una cuenta con ese mail. Iniciá sesión.";
  if (m.includes("rate limit")) return "Hiciste muchos intentos seguidos. Esperá unos minutos y probá de nuevo.";
  if (m.includes("password")) return "La contraseña tiene que tener al menos 6 caracteres.";
  return "Algo salió mal. Probá de nuevo.";
}

export default function FormularioLogin() {
  const router = useRouter();
  const errorEnDireccion = useSearchParams().get("error");
  const [modo, setModo] = useState<"entrar" | "registrarme">("entrar");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje>(null);

  // Si volvemos de Google o del mail con un error, lo mostramos con el motivo.
  const mensajeVisible: Mensaje =
    mensaje ??
    (errorEnDireccion
      ? { tipo: "error", texto: `No pudimos iniciar tu sesión. Motivo: ${errorEnDireccion}` }
      : null);

  async function entrarConGoogle() {
    const supabase = createClient();
    setCargando(true);
    setMensaje(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setMensaje({ tipo: "error", texto: "No pudimos conectar con Google. Probá de nuevo." });
      setCargando(false);
    }
  }

  async function entrarConMail(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const supabase = createClient();
    setCargando(true);
    setMensaje(null);

    if (modo === "registrarme") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          // Guardamos el nombre: el perfil lo toma de acá al crearse.
          data: { full_name: nombre.trim() },
        },
      });
      if (error) {
        setMensaje({ tipo: "error", texto: traducirError(error.message) });
      } else {
        setMensaje({
          tipo: "ok",
          texto: `Te mandamos un mail a ${email}. Abrí el link desde este mismo navegador para confirmar tu cuenta.`,
        });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMensaje({ tipo: "error", texto: traducirError(error.message) });
      } else {
        router.push("/app");
        return;
      }
    }
    setCargando(false);
  }

  const esRegistro = modo === "registrarme";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-10 pt-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <Logo tamano={72} conNombre />
        <h1 className="mt-6 text-balance text-[28px] font-bold leading-tight tracking-tight">
          Tu carrera entera, organizada en un solo lugar
        </h1>
        <p className="text-suave">
          {esRegistro ? "Creá tu cuenta en un minuto." : "Iniciá sesión para seguir con tu carrera."}
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <button
          type="button"
          onClick={entrarConGoogle}
          disabled={cargando}
          className="flex h-14 items-center justify-center gap-3 rounded-2xl border border-linea bg-superficie font-semibold transition hover:bg-fondo disabled:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" />
            <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
            <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
            <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.8 3.6-4.9 6.7-4.9z" />
          </svg>
          Continuar con Google
        </button>

        <div className="my-2 flex items-center gap-3 text-sm text-suave">
          <span className="h-px flex-1 bg-linea" />
          o con tu mail
          <span className="h-px flex-1 bg-linea" />
        </div>

        <form onSubmit={entrarConMail} className="flex flex-col gap-3">
          {esRegistro && (
            <>
              <label htmlFor="nombre" className="text-sm font-semibold">
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                required
                minLength={2}
                maxLength={60}
                autoComplete="given-name"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="h-13 rounded-2xl border border-linea bg-superficie px-4 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro"
              />
            </>
          )}
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
          <label htmlFor="password" className="mt-1 text-sm font-semibold">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={esRegistro ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-13 rounded-2xl border border-linea bg-superficie px-4 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro"
          />
          {esRegistro && <p className="text-sm text-suave">Mínimo 6 caracteres.</p>}

          {mensajeVisible && (
            <p
              role={mensajeVisible.tipo === "error" ? "alert" : "status"}
              className={
                mensajeVisible.tipo === "error"
                  ? "rounded-xl bg-error-claro px-4 py-3 text-sm text-error"
                  : "rounded-xl bg-acento-claro px-4 py-3 text-sm text-acento-hover"
              }
            >
              {mensajeVisible.texto}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="mt-2 h-14 rounded-2xl bg-acento font-semibold text-white transition hover:bg-acento-hover disabled:opacity-60"
          >
            {cargando ? "Un momento…" : esRegistro ? "Crear cuenta" : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-4 text-center text-[15px] text-suave">
          {esRegistro ? "¿Ya tenés cuenta? " : "¿Todavía no tenés cuenta? "}
          <button
            type="button"
            onClick={() => {
              setModo(esRegistro ? "entrar" : "registrarme");
              setMensaje(null);
            }}
            className="font-semibold text-acento underline-offset-2 hover:underline"
          >
            {esRegistro ? "Iniciá sesión" : "Creá tu cuenta"}
          </button>
        </p>
      </div>
    </main>
  );
}