import { Suspense } from "react";
import { cargarMateria } from "@/lib/datos/materia";
import { obtenerParciales } from "@/lib/datos/parciales";
import Parciales from "./Parciales";

// Pestaña Parciales: notas de cada parcial y cómo va el alumno.
export default function ParcialesPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <Contenido params={params} />
    </Suspense>
  );
}

async function Contenido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { usuarioId } = await cargarMateria(id);
  const inicial = await obtenerParciales(usuarioId, id);
  return <Parciales materiaId={id} inicial={inicial} />;
}