import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cargarMateria } from "@/lib/datos/materia";
import { obtenerCarpetas } from "@/lib/datos/carpetas";
import { obtenerArchivos } from "@/lib/datos/archivos";
import IconoCarpeta from "@/components/IconoCarpeta";
import OpcionesCarpeta from "./OpcionesCarpeta";
import SubirArchivos from "./SubirArchivos";
import ListaArchivos from "./ListaArchivos";

// Una carpeta abierta: sus archivos, el botón para subir y, si es propia, renombrarla o borrarla.
export default function CarpetaPage({ params }: { params: Promise<{ id: string; carpeta: string }> }) {
  return (
    <Suspense fallback={null}>
      <Contenido params={params} />
    </Suspense>
  );
}

async function Contenido({ params }: { params: Promise<{ id: string; carpeta: string }> }) {
  const { id, carpeta: carpetaId } = await params;
  const { usuarioId } = await cargarMateria(id);
  const carpetas = await obtenerCarpetas(usuarioId, id);
  const carpeta = carpetas.find((c) => c.id === carpetaId);
  if (!carpeta) {
    notFound();
  }
  const archivos = await obtenerArchivos(usuarioId, id, carpeta.id);

  return (
    <div className="flex flex-col gap-4">
      <Link href={`/app/materia/${id}/archivos`} className="text-sm font-semibold text-acento hover:underline">
        ← Carpetas
      </Link>

      <div className="flex items-center gap-3">
        <IconoCarpeta propia={!carpeta.fija} tamano={44} />
        <h2 className="text-xl font-bold">{carpeta.nombre}</h2>
      </div>

      {!carpeta.fija && <OpcionesCarpeta materiaId={id} carpetaId={carpeta.id} nombre={carpeta.nombre} />}

      <SubirArchivos materiaId={id} carpeta={carpeta.id} />

      <ListaArchivos materiaId={id} archivos={archivos} carpetas={carpetas} carpetaActual={carpeta.id} />
    </div>
  );
}