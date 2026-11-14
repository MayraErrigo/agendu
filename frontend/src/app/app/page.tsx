import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";

// Pantalla provisoria de /app. Si el alumno no eligió carrera, lo manda a elegirla.
// En la etapa 7 la reemplazamos por la pantalla Inicio.
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

type PerfilConCarrera = {
  nombre: string | null;
  plan_id: string | null;
  regionales: { nombre: string; sigla: string } | null;
  planes: { nombre: string; carreras: { nombre: string } } | null;
};

async function Bienvenida() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("perfiles")
    .select("nombre, plan_id, regionales ( nombre, sigla ), planes ( nombre, carreras ( nombre ) )")
    .eq("id", user.id)
    .maybeSingle();

  const perfil = data as unknown as PerfilConCarrera | null;

  if (!perfil?.plan_id) {
    redirect("/app/carrera");
  }

  const nombre = perfil.nombre?.split(" ")[0] ?? user.email;

  return (
    <>
      <h1 className="mt-10 text-[28px] font-bold leading-tight tracking-tight">Hola, {nombre}</h1>
      <p className="mt-2 text-suave">Tu carrera quedó guardada. El próximo paso es cargar tu avance.</p>

      <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl bg-superficie p-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-suave">Tu carrera</span>
          <span className="font-semibold">{perfil.planes?.carreras.nombre}</span>
          <span className="text-sm text-suave">
            {perfil.regionales?.nombre} · {perfil.planes?.nombre}
          </span>
        </div>
        <Link href="/app/carrera" className="text-sm font-semibold text-acento hover:underline">
          Cambiar
        </Link>
      </div>

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