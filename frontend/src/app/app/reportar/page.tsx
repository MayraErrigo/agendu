import Link from "next/link";
import FormularioReporte from "./FormularioReporte";

// Reportar un error en el plan de estudios.
export default function ReportarPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-5 pt-12">
      <Link href="/app/perfil" className="text-sm font-semibold text-acento hover:underline">
        ← Volver
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">Reportar un error</h1>
        <p className="text-suave">
          Una correlativa que no coincide, un nombre mal escrito, una materia en el año equivocado. Contanos y lo
          corregimos.
        </p>
      </div>
      <FormularioReporte />
      <p className="text-sm text-suave">
        ¿Falta una materia?{" "}
        <Link href="/app/plan/agregar" className="font-semibold text-acento hover:underline">
          Agregala a tu plan
        </Link>
      </p>
    </main>
  );
}