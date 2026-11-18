import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenerUso } from "@/lib/datos/archivos";
import BarraEspacio from "@/components/BarraEspacio";
import EditarNombre from "./EditarNombre";

// Pantalla Perfil: los datos del alumno, su carrera y la salida.
export default function PerfilPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-5 pt-12">
      <h1 className="text-[28px] font-bold leading-tight tracking-tight">Perfil</h1>
      <Suspense fallback={<p className="text-suave">Cargando tu perfil…</p>}>
        <Contenido />
      </Suspense>
    </main>
  );
}

type Perfil = {
  nombre: string | null;
  regionales: { nombre: string; sigla: string } | null;
  planes: { nombre: string; carreras: { nombre: string } } | null;
};

async function Contenido() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("perfiles")
    .select("nombre, regionales ( nombre, sigla ), planes ( nombre, carreras ( nombre ) )")
    .eq("id", user.id)
    .maybeSingle();
  const perfil = data as unknown as Perfil | null;
  const uso = await obtenerUso(user.id);

  return (
    <>
      {/* Datos personales */}
      <section className="flex flex-col gap-4 rounded-3xl bg-superficie p-5 shadow-sm">
        <EditarNombre nombre={perfil?.nombre ?? ""} />
        <div className="flex flex-col gap-0.5 border-t border-fondo pt-4">
          <span className="text-sm font-semibold">Mail</span>
          <span className="break-all text-sm text-suave">{user.email}</span>
        </div>
      </section>

      {/* Carrera */}
      <section className="flex flex-col gap-4 rounded-3xl bg-superficie p-5 shadow-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-suave">Tu carrera</span>
          {perfil?.planes ? (
            <>
              <span className="font-bold leading-snug">{perfil.planes.carreras.nombre}</span>
              <span className="text-sm text-suave">
                UTN {perfil.regionales?.nombre ?? ""} · {perfil.planes.nombre}
              </span>
            </>
          ) : (
            <span className="text-sm text-suave">Todavía no elegiste tu carrera.</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Opcion href="/app/avance" texto="Editar mi avance" detalle="Marcar varias materias de una vez" />
          <Opcion href="/app/carrera" texto="Cambiar de carrera o de plan" />
          <Opcion href="/app/plan/agregar" texto="Agregar una materia que no figura" />
          <Opcion href="/app/reportar" texto="Reportar un error en el plan" />
        </div>
      </section>

      {/* Espacio para archivos */}
      <section className="rounded-3xl bg-superficie p-5 shadow-sm">
        <BarraEspacio usado={uso.usado} limite={uso.limite} />
      </section>

      {/* Salir */}
      <form action="/auth/salir" method="post">
        <button
          type="submit"
          className="h-14 w-full rounded-2xl border border-linea bg-superficie font-semibold text-error transition hover:bg-error-claro"
        >
          Cerrar sesión
        </button>
      </form>
    </>
  );
}

function Opcion({ href, texto, detalle }: { href: string; texto: string; detalle?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl border border-linea px-4 py-3 transition hover:bg-fondo">
      <span className="flex flex-1 flex-col">
        <span className="font-semibold">{texto}</span>
        {detalle && <span className="text-xs text-suave">{detalle}</span>}
      </span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-suave" aria-hidden="true">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </Link>
  );
}