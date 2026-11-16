import { Suspense } from "react";
import { cargarMateria } from "@/lib/datos/materia";
import { obtenerFicha } from "@/lib/datos/ficha";
import Importante from "./Importante";

// Pestaña Importante: lo que el alumno no se puede olvidar de esta materia.
export default function ImportantePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <Contenido params={params} />
    </Suspense>
  );
}

async function Contenido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { usuarioId } = await cargarMateria(id);
  const ficha = await obtenerFicha(usuarioId, id);
  return <Importante materiaId={id} texto={ficha.anotaciones} />;
}