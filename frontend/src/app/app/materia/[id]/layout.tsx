import { Suspense } from "react";
import Link from "next/link";
import { cargarMateria } from "@/lib/datos/materia";
import { nombreDelAnio } from "@/lib/datos/plan";
import { obtenerParciales } from "@/lib/datos/parciales";
import { puedeRendir, situacion } from "@/lib/logica/correlativas";
import { resumirParciales } from "@/lib/logica/parciales";
import PestanasMateria from "@/components/PestanasMateria";

const ETIQUETA = {
  aprobada: { texto: "Aprobada", clases: "bg-acento-claro text-acento-hover" },
  regular: { texto: "Regular", clases: "bg-arena text-arena-tinta" },
  cursando: { texto: "Cursando", clases: "bg-pizarra text-pizarra-tinta" },
  disponible: { texto: "Disponible", clases: "border-2 border-acento text-acento" },
  bloqueada: { texto: "Bloqueada", clases: "bg-bloqueo text-bloqueo-tinta" },
} as const;

// El espacio de una materia: encabezado y pestañas, compartidos por todas sus secciones.
export default function MateriaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-5 pb-10 pt-12">
      <Link href="/app/plan" className="text-sm font-semibold text-acento hover:underline">
        ← Volver al plan
      </Link>
      <Suspense fallback={<p className="text-suave">Cargando la materia…</p>}>
        <Encabezado params={params} />
      </Suspense>
      {children}
    </main>
  );
}

async function Encabezado({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { usuarioId, materia, estados, indice } = await cargarMateria(id);
  const sit = situacion(id, indice, estados);

  // Si está regular con promoción práctica, el final es solo teórico.
  const practica =
    sit === "regular" &&
    resumirParciales(await obtenerParciales(usuarioId, id)).situacion === "promocion_practica";

  return (
    <>
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-suave">
            {nombreDelAnio(materia.nivel)}
            {materia.tipo === "electiva" ? " · Electiva" : ""}
            {materia.creditos ? ` · ${materia.creditos} créditos` : ""}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ETIQUETA[sit].clases}`}>
            {ETIQUETA[sit].texto}
          </span>
        </div>
        <h1 className="text-[26px] font-bold leading-tight tracking-tight">{materia.nombre}</h1>
        {practica && (
          <span className="self-start rounded-full bg-pizarra px-2.5 py-1 text-xs font-bold text-pizarra-tinta">
            Promoción práctica · final teórico
          </span>
        )}
        {sit === "regular" && (
          <p className="text-sm font-semibold text-arena-tinta">
            {puedeRendir(id, indice, estados) ? "Ya podés rendir el final." : "Todavía no podés rendir el final."}
          </p>
        )}
        {!materia.se_dicta && <p className="text-sm text-suave">Esta electiva no se dicta actualmente.</p>}
      </header>
      <PestanasMateria materiaId={id} />
    </>
  );
}