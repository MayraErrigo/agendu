"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const campo =
  "h-12 rounded-2xl border border-linea bg-superficie px-4 outline-none focus:border-acento focus:ring-2 focus:ring-acento-claro";

// Formulario de contraseña nueva. Lo usan la pantalla del link del mail y Perfil.
// En Perfil se pide también la contraseña actual (pasando "email"); desde el link del mail no,
// porque justamente la persona se la olvidó.
export default function CambiarContrasena({
  alTerminar,
  email,
}: {
  alTerminar: "ir-a-la-app" | "quedarse";
  email?: string;
}) {
  const router = useRouter();
  const pedirActual = Boolean(email);
  const [actual, setActual] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [repetida, setRepetida] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "error" | "ok"; texto: string } | null>(null);

  async function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensaje(null);
    if (contrasena.length < 6) {
      setMensaje({ tipo: "error", texto: "La contraseña tiene que tener al menos 6 caracteres." });
      return;
    }
    if (contrasena !== repetida) {
      setMensaje({ tipo: "error", texto: "Las dos contraseñas nuevas no coinciden." });
      return;
    }
    if (pedirActual && contrasena === actual) {
      setMensaje({ tipo: "error", texto: "La contraseña nueva tiene que ser distinta de la actual." });
      return;
    }

    setGuardando(true);
    const supabase = createClient();

    // En Perfil: primero comprobamos que la contraseña actual sea la correcta.
    if (pedirActual && email) {
      const { error: errorActual } = await supabase.auth.signInWithPassword({ email, password: actual });
      if (errorActual) {
        setGuardando(false);
        setMensaje({
          tipo: "error",
          texto: errorActual.message.toLowerCase().includes("rate limit")
            ? "Hiciste muchos intentos seguidos. Esperá unos minutos."
            : "La contraseña actual no es correcta.",
        });
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({ password: contrasena });
    setGuardando(false);

    if (error) {
      const m = error.message.toLowerCase();
      setMensaje({
        tipo: "error",
        texto: m.includes("different from the old")
          ? "La contraseña nueva tiene que ser distinta de la anterior."
          : m.includes("session")
            ? "El link venció. Pedí uno nuevo."
            : "No pudimos guardarla. Probá de nuevo.",
      });
      return;
    }

    if (alTerminar === "ir-a-la-app") {
      router.push("/app");
      return;
    }
    setActual("");
    setContrasena("");
    setRepetida("");
    setMensaje({ tipo: "ok", texto: "Listo, cambiaste tu contraseña." });
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-3">
      {pedirActual && (
        <>
          <label htmlFor="contrasena-actual" className="text-sm font-semibold">
            Contraseña actual
          </label>
          <input
            id="contrasena-actual"
            type="password"
            required
            autoComplete="current-password"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            className={campo}
          />
        </>
      )}
      <label htmlFor="contrasena-nueva" className="text-sm font-semibold">
        Contraseña nueva
      </label>
      <input
        id="contrasena-nueva"
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        className={campo}
      />
      <label htmlFor="contrasena-repetida" className="text-sm font-semibold">
        Repetí la contraseña nueva
      </label>
      <input
        id="contrasena-repetida"
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
        value={repetida}
        onChange={(e) => setRepetida(e.target.value)}
        className={campo}
      />
      <span className="text-xs text-suave">Mínimo 6 caracteres.</span>

      {mensaje && (
        <p
          role={mensaje.tipo === "error" ? "alert" : "status"}
          className={
            mensaje.tipo === "error"
              ? "rounded-xl bg-error-claro px-4 py-3 text-sm text-error"
              : "rounded-xl bg-acento-claro px-4 py-3 text-sm text-acento-hover"
          }
        >
          {mensaje.texto}
        </p>
      )}

      <button
        type="submit"
        disabled={guardando}
        className="mt-1 h-14 rounded-2xl bg-acento font-semibold text-white transition hover:bg-acento-hover disabled:opacity-60"
      >
        {guardando ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}