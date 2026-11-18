import { Suspense } from "react";
import { cargarMateria } from "@/lib/datos/materia";
import { obtenerCarpetas } from "@/lib/datos/carpetas";
import Carpetas from "./Carpetas";

// Pestaña Archivos: las carpetas de la materia.
export default function ArchivosPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <Contenido params={params} />
    </Suspense>
  );
}

async function Contenido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { usuarioId } = await cargarMateria(id);
  const carpetas = await obtenerCarpetas(usuarioId, id);
  // Por ahora todas están vacías: los archivos llegan en la tanda 2.
  return <Carpetas materiaId={id} carpetas={carpetas} cantidades={{}} />;
}