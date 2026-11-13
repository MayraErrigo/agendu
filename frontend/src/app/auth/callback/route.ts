import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Acá vuelve el alumno después de entrar con Google o de abrir el mail de confirmación.
// Supabase manda un código que cambiamos por la sesión iniciada.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/app`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=1`);
}
