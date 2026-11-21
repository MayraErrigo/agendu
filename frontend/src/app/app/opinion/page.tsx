import Link from "next/link";
import FormularioOpinion from "./FormularioOpinion";

// Mandar una opinión sobre la app.
export default function OpinionPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-5 pt-12">
      <Link href="/app/perfil" className="text-sm font-semibold text-acento hover:underline">
        ← Volver
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">Mandanos tu opinión</h1>
        <p className="text-suave">Qué te gusta, qué no se entiende o qué te falta. Todo nos sirve para mejorar Agendu.</p>
      </div>
      <FormularioOpinion />
    </main>
  );
}