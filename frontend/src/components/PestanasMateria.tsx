"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Las pestañas de una materia. Se marca la que corresponde a la dirección actual.
export default function PestanasMateria({ materiaId }: { materiaId: string }) {
  const ruta = usePathname();
  const base = `/app/materia/${materiaId}`;
  const pestanas = [
    { href: base, texto: "Resumen" },
    { href: `${base}/importante`, texto: "Importante" },
    { href: `${base}/tareas`, texto: "Tareas" },
    { href: `${base}/parciales`, texto: "Parciales" },
    { href: `${base}/archivos`, texto: "Archivos" },
  ];

  return (
    <nav aria-label="Secciones de la materia" className="-mx-5 overflow-x-auto px-5">
      <ul className="flex w-max gap-1 rounded-2xl bg-bloqueo p-1">
        {pestanas.map((p) => {
          // Resumen solo en su dirección exacta; las demás también cuando estás adentro (ej.: una carpeta de Archivos).
          const activa = p.href === base ? ruta === base : ruta.startsWith(p.href);
          return (
            <li key={p.href}>
              <Link
                href={p.href}
                aria-current={activa ? "page" : undefined}
                className={`flex h-10 items-center rounded-xl px-3.5 text-sm transition ${
                  activa ? "bg-superficie font-bold text-tinta shadow-sm" : "font-semibold text-suave hover:text-tinta"
                }`}
              >
                {p.texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}