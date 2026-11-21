import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import CambiarContrasena from "@/components/CambiarContrasena";

// Acá llega el alumno desde el link del mail de "olvidé mi contraseña".
export default function NuevaContrasenaPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-10 pt-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <Logo tamano={56} conNombre />
        <h1 className="mt-6 text-[26px] font-bold leading-tight tracking-tight">Elegí una contraseña nueva</h1>
      </div>
      <div className="mt-10">
        <Suspense fallback={<p className="text-center text-suave">Un momento…</p>}>
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

  // Sin sesión: el link venció, ya se usó o se abrió en otro navegador.
  if (!user) {
    return (
      <div className="flex flex-col gap-4 rounded-3xl bg-error-claro p-5 text-error">
        <p className="font-bold">El link venció o ya se usó</p>
        <p className="text-sm">
          Los links sirven una sola vez, durante una hora, y hay que abrirlos en el mismo navegador donde los pediste.
        </p>
        <Link href="/recuperar" className="font-semibold underline">
          Pedir un link nuevo
        </Link>
      </div>
    );
  }

  return <CambiarContrasena alTerminar="ir-a-la-app" />;
}