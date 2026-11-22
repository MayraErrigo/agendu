import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { nombreDelAnio, obtenerEstados, obtenerMaterias } from "@/lib/datos/plan";
import { linkOculto } from "@/lib/logica/links";
import ImportarCalendario from "./ImportarCalendario";

// Traer fechas de la UV, Google, Apple u Outlook.
export default function ImportarPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-5 pt-12">
      <Link href="/app" className="text-sm font-semibold text-acento hover:underline">
        ← Volver
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">Traé tus fechas</h1>
        <p className="text-suave">
          Conectá el calendario donde ya tenés las fechas de la facu. Después elegís cuáles traer.
        </p>
      </div>
      <Suspense fallback={<p className="text-suave">Cargando…</p>}>
        <Contenido />
      </Suspense>
    </main>
  );
}

async function Contenido() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("plan_id, regional_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!perfil?.plan_id) {
    redirect("/app/carrera");
  }

  const [materias, estados, { data: conexion }] = await Promise.all([
    obtenerMaterias(perfil.plan_id, perfil.regional_id),
    obtenerEstados(user.id),
    supabase.from("conexiones_calendario").select("origen, url").eq("usuario_id", user.id).maybeSingle(),
  ]);

  // De cada materia, lo que necesita la pantalla: si la cursás, si ya la aprobaste y en qué grupo va en el buscador.
  const lista = materias.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    cursando: estados[m.id] === "cursando",
    aprobada: estados[m.id] === "aprobada",
    grupo: m.tipo === "electiva" ? "Electivas" : nombreDelAnio(m.nivel),
    orden: m.tipo === "electiva" ? 99 : m.nivel,
  }));

  return (
    <ImportarCalendario
      materias={lista}
      conectado={conexion ? { origen: conexion.origen as string, link: linkOculto(conexion.url as string) } : null}
    />
  );
}