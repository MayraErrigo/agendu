import Link from "next/link";
import FormularioAgregar from "./FormularioAgregar";

// Agregar una materia que no figura en el plan.
export default function AgregarPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-5 pt-12">
      <Link href="/app/plan" className="text-sm font-semibold text-acento hover:underline">
        ← Volver al plan
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">Agregar una materia</h1>
        <p className="text-suave">
          Si una materia de tu plan no figura, agregala acá. Te aparece al instante en tu plan y a nosotros nos llega
          el aviso para sumarla para todos.
        </p>
      </div>
      <FormularioAgregar />
    </main>
  );
}