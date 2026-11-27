import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import FormularioArrepentimiento from "./FormularioArrepentimiento";

export const metadata: Metadata = {
  title: "Botón de arrepentimiento · Agendu",
};

// Botón de arrepentimiento (Ley 24.240 y Disposición 954/2025): se puede pedir sin iniciar sesión.
export default function ArrepentimientoPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-6 pb-16 pt-12">
      <Link href="/" aria-label="Ir a Agendu">
        <Logo tamano={40} conNombre />
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">Botón de arrepentimiento</h1>
        <p className="text-suave">
          Si te suscribiste al plan completo y te arrepentiste, podés cancelarlo dentro de los{" "}
          <strong>10 días corridos</strong> desde que lo contrataste. Te devolvemos todo lo que pagaste, sin costo y sin
          tener que explicar por qué.
        </p>
      </header>

      <FormularioArrepentimiento />

      <p className="text-sm text-suave">
        Si pasaron más de 10 días, podés dar de baja tu suscripción cuando quieras desde Perfil: no se te cobra el mes
        siguiente.
      </p>

      <Link href="/" className="text-sm font-semibold text-acento hover:underline">
        ← Volver a Agendu
      </Link>
    </main>
  );
}