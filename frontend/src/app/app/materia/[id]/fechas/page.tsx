import { Suspense } from "react";
import { cargarMateria } from "@/lib/datos/materia";
import { fechasDeParciales, obtenerFechas } from "@/lib/datos/fechas";
import { obtenerParciales } from "@/lib/datos/parciales";
import { hoyEnArgentina, separarPorFecha } from "@/lib/logica/fechas";
import Fechas from "./Fechas";

// Pestaña Fechas: entregas, lecciones, evaluaciones y presentaciones, más los parciales.
export default function FechasPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <Contenido params={params} />
    </Suspense>
  );
}

async function Contenido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { usuarioId } = await cargarMateria(id);
  const [fechas, parciales] = await Promise.all([obtenerFechas(usuarioId, id), obtenerParciales(usuarioId, id)]);
  const { proximas, pasadas } = separarPorFecha([...fechas, ...fechasDeParciales(parciales)], hoyEnArgentina());
  return <Fechas materiaId={id} proximas={proximas} pasadas={pasadas} />;
}