import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";

// Pantalla de prueba: confirma que el login funciona.
// En la etapa 3 la reemplazamos por "Elegí tu carrera".
export default function AppPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-10 pt-14">
      <Logo tamano={40} conNombre />
      <Suspense fallback={<p className="mt-10 text-suave">Cargando…</p>}>
        <Bienvenida />
      </Suspense>
    </main>
  );
}

// Esta parte lee la sesión del alumno, por eso va dentro de <Suspense>
// (lo pide el modo cacheComponents de Next.js 16).
async function Bienvenida() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombre")
    .eq("id", user.id)
    .single();

  const nombre = perfil?.nombre?.split(" ")[0] ?? user.email;

  return (
    <>
      <h1 className="mt-10 text-[28px] font-bold leading-tight tracking-tight">Hola, {nombre}</h1>
      <p className="mt-2 text-suave">Tu cuenta ya funciona. El próximo paso es elegir tu carrera.</p>
      <p className="mt-6 rounded-2xl bg-superficie p-4 text-sm text-suave">
        Sesión iniciada como <span className="font-semibold text-tinta">{user.email}</span>
      </p>

      <form action="/auth/salir" method="post" className="mt-auto pt-10">
        <button
          type="submit"
          className="h-14 w-full rounded-2xl border border-linea bg-superficie font-semibold transition hover:bg-fondo"
        >
          Cerrar sesión
        </button>
      </form>
    </>
  );
}