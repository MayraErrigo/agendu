import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { obtenerOfertas } from "@/lib/datos/carreras";
import ElegirCarrera from "./ElegirCarrera";

// Paso 2 de 3 del recorrido inicial: el alumno elige qué estudia.
export default function CarreraPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-10 pt-14">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1.5" aria-hidden="true">
          <span className="h-1.5 flex-1 rounded-full bg-acento" />
          <span className="h-1.5 flex-1 rounded-full bg-acento" />
          <span className="h-1.5 flex-1 rounded-full bg-linea" />
        </div>
        <span className="text-sm font-semibold text-suave">Paso 2 de 3</span>
      </div>

      <h1 className="mt-8 text-[28px] font-bold leading-tight tracking-tight">¿Qué estudiás?</h1>
      <p className="mt-2 text-suave">Con esto cargamos tu plan de estudios completo, con sus correlativas.</p>

      <div className="mt-8 flex flex-1 flex-col">
        <Suspense fallback={<p className="text-suave">Cargando carreras…</p>}>
          <Contenido />
        </Suspense>
      </div>
    </main>
  );
}

// Lee la sesión, el perfil y las carreras: por eso va dentro de <Suspense>.
async function Contenido() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: perfil }, ofertas] = await Promise.all([
    supabase.from("perfiles").select("regional_id, plan_id").eq("id", user.id).maybeSingle(),
    obtenerOfertas(),
  ]);

  return (
    <ElegirCarrera
      ofertas={ofertas}
      actual={{ regionalId: perfil?.regional_id ?? null, planId: perfil?.plan_id ?? null }}
    />
  );
}