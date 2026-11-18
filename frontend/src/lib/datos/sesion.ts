import { createClient } from "@/lib/supabase/server";
import { obtenerMaterias } from "@/lib/datos/plan";

// Para las acciones de las pestañas de una materia: comprueba que haya sesión
// y que la materia sea del plan del alumno. Devuelve el cliente listo para usar.
export async function validarMateria(materiaId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tu sesión se cerró. Volvé a iniciar sesión." } as const;

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("plan_id, regional_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!perfil?.plan_id) return { error: "Primero elegí tu carrera." } as const;

  const materias = await obtenerMaterias(perfil.plan_id, perfil.regional_id);
  if (!materias.some((m) => m.id === materiaId)) {
    return { error: "Esa materia no pertenece a tu plan." } as const;
  }
  return { supabase, usuarioId: user.id } as const;
}