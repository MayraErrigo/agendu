import { Suspense } from "react";
import { cargarMateria } from "@/lib/datos/materia";
import { obtenerFicha } from "@/lib/datos/ficha";
import { obtenerParciales } from "@/lib/datos/parciales";
import Importante from "./Importante";

// Pestaña Importante: cómo se aprueba la materia y lo que el alumno no se puede olvidar.
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
  const [ficha, condiciones] = await Promise.all([obtenerFicha(usuarioId, id), obtenerParciales(usuarioId, id)]);
  return <Importante materiaId={id} texto={ficha.anotaciones} condiciones={condiciones} />;
}