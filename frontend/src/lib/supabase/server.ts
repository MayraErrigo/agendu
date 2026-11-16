import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

export async function createClient() {
  // Le avisamos a Next.js que esto depende de cada visita (la sesión del alumno),
  // así no intenta prepararlo de antemano. Lo pide el modo cacheComponents.
  await connection();
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Si se llama desde un Server Component no se pueden guardar cookies;
            // el proxy se encarga de renovar la sesión.
          }
        },
      },
    }
  );
}