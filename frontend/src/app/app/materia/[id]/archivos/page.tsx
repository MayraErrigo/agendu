import { Suspense } from "react";
import { cargarMateria } from "@/lib/datos/materia";
import { obtenerCarpetas } from "@/lib/datos/carpetas";
import { obtenerCantidades, obtenerUso } from "@/lib/datos/archivos";
import BarraEspacio from "@/components/BarraEspacio";
import Carpetas from "./Carpetas";

// Pestaña Archivos: el espacio usado y las carpetas de la materia.
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
  const [carpetas, cantidades, uso] = await Promise.all([
    obtenerCarpetas(usuarioId, id),
    obtenerCantidades(usuarioId, id),
    obtenerUso(usuarioId),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <BarraEspacio usado={uso.usado} limite={uso.limite} />
      <Carpetas materiaId={id} carpetas={carpetas} cantidades={cantidades} />
    </div>
  );
}