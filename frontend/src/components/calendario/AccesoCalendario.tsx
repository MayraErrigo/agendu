import Link from "next/link";
import { estadoConexion, haceCuanto, type ConexionCalendario } from "@/lib/logica/conexion";

// El acceso a "Traer fechas" debajo del calendario. Cambia según el calendario conectado:
// sin conectar · al día · hace mucho que no busca (dorado) · el link dejó de funcionar (rojo).
export default function AccesoCalendario({ conexion, hoy }: { conexion: ConexionCalendario | null; hoy: string }) {
  let titulo = "Traer fechas de la UV";
  let detalle = "O de Google, Apple u Outlook";
  let estilo = "border border-dashed border-suave hover:border-acento hover:bg-fondo";
  let icono = "bg-acento-claro text-acento-hover";

  if (conexion) {
    const estado = estadoConexion(conexion, hoy);
    if (estado.nivel === "error") {
      titulo = `El link de ${estado.nombre} dejó de funcionar`;
      detalle = "Tocá para volver a conectarlo";
      estilo = "bg-error-claro text-error";
      icono = "bg-superficie text-error";
    } else if (estado.nivel === "aviso") {
      titulo = estado.dias === null ? "Buscá fechas nuevas" : `Hace ${estado.dias} días que no buscás fechas nuevas`;
      detalle = `${estado.nombre} conectado · Buscar fechas nuevas`;
      estilo = "bg-arena text-arena-tinta";
      icono = "bg-superficie text-arena-tinta";
    } else {
      titulo = "Buscar fechas nuevas";
      detalle = `${estado.nombre} conectado · última búsqueda ${haceCuanto(estado.dias)}`;
      estilo = "border border-linea hover:border-acento hover:bg-fondo";
    }
  }

  return (
    <Link href="/app/calendario/importar" className={`flex items-center gap-3 rounded-2xl p-3 transition ${estilo}`}>
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${icono}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 4v12M7 11l5 5 5-5M5 20h14" />
        </svg>
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-sm font-bold">{titulo}</span>
        <span className={`text-xs ${conexion ? "" : "text-suave"}`}>{detalle}</span>
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-60" aria-hidden="true">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </Link>
  );
}