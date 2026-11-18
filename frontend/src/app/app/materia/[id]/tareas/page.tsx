import { Suspense } from "react";
import { cargarMateria } from "@/lib/datos/materia";
import { obtenerTareas } from "@/lib/datos/tareas";
import Tareas from "./Tareas";

// Pestaña Tareas: lo que el alumno tiene que hacer en esta materia.
export default function TareasPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <Contenido params={params} />
    </Suspense>
  );
}

async function Contenido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { usuarioId } = await cargarMateria(id);
  const tareas = await obtenerTareas(usuarioId, id);
  return <Tareas materiaId={id} tareas={tareas} />;
}