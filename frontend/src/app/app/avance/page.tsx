import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { nombreDelAnio, obtenerEstados, obtenerMaterias } from "@/lib/datos/plan";
import CargarAvance from "./CargarAvance";

// Paso 3 de 3 del recorrido inicial: el alumno marca lo que ya hizo.
export default function AvancePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-10 pt-14">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1.5" aria-hidden="true">
          <span className="h-1.5 flex-1 rounded-full bg-acento" />
          <span className="h-1.5 flex-1 rounded-full bg-acento" />
          <span className="h-1.5 flex-1 rounded-full bg-acento" />
        </div>
        <span className="text-sm font-semibold text-suave">Paso 3 de 3</span>
      </div>

      <h1 className="mt-8 text-[28px] font-bold leading-tight tracking-tight">¿Hasta dónde llegaste?</h1>
      <p className="mt-2 text-suave">Vamos año por año. Si aprobaste todo, un toque y listo.</p>

      <div className="mt-8 flex flex-1 flex-col">
        <Suspense fallback={<p className="text-suave">Cargando tu plan…</p>}>
          <Contenido />
        </Suspense>
      </div>
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

  const [materias, estados] = await Promise.all([
    obtenerMaterias(perfil.plan_id, perfil.regional_id),
    obtenerEstados(user.id),
  ]);

  // Las obligatorias van agrupadas por año; las electivas, todas juntas al final.
  const obligatorias = materias.filter((m) => m.tipo === "obligatoria");
  const electivas = materias.filter((m) => m.tipo === "electiva");
  const niveles = [...new Set(obligatorias.map((m) => m.nivel))];

  const grupos = niveles.map((nivel) => ({
    clave: `nivel-${nivel}`,
    titulo: nombreDelAnio(nivel),
    materias: obligatorias.filter((m) => m.nivel === nivel),
    esElectiva: false,
  }));
  if (electivas.length) {
    grupos.push({ clave: "electivas", titulo: "Electivas", materias: electivas, esElectiva: true });
  }

  return <CargarAvance grupos={grupos} estadosIniciales={estados} />;
}