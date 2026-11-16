"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Pantallas del recorrido inicial: ahí la barra no se muestra.
const SIN_BARRA = ["/app/carrera", "/app/avance"];

const SECCIONES = [
  { href: "/app", texto: "Inicio", icono: "inicio" },
  { href: "/app/plan", texto: "Plan", icono: "plan" },
  { href: "/app/cursando", texto: "Cursando", icono: "cursando" },
  { href: "/app/perfil", texto: "Perfil", icono: "perfil" },
] as const;

// Una sección está activa si estamos en ella o dentro de ella.
// Las fichas de materia (/app/materia/…) cuentan como parte del Plan.
function estaActiva(ruta: string, href: string) {
  if (href === "/app") return ruta === "/app";
  if (href === "/app/plan") return ruta.startsWith("/app/plan") || ruta.startsWith("/app/materia");
  return ruta.startsWith(href);
}

// La barra de navegación fija de abajo, como en las apps del celular.
export default function BarraNavegacion() {
  const ruta = usePathname();
  if (SIN_BARRA.some((r) => ruta.startsWith(r))) return null;

  return (
    <>
      {/* Espacio para que la barra no tape el final de la pantalla */}
      <div className="h-24" aria-hidden="true" />
      <nav
        aria-label="Secciones"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-linea bg-superficie/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      >
        <ul className="mx-auto flex max-w-md">
          {SECCIONES.map((s) => {
            const activa = estaActiva(ruta, s.href);
            return (
              <li key={s.href} className="flex-1">
                <Link
                  href={s.href}
                  aria-current={activa ? "page" : undefined}
                  className={`flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold transition ${
                    activa ? "text-acento" : "text-suave hover:text-tinta"
                  }`}
                >
                  <Icono nombre={s.icono} activo={activa} />
                  {s.texto}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

function Icono({ nombre, activo }: { nombre: (typeof SECCIONES)[number]["icono"]; activo: boolean }) {
  const comunes = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: activo ? 2.2 : 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (nombre) {
    case "inicio":
      return (
        <svg {...comunes}>
          <path d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />
        </svg>
      );
    case "plan":
      return (
        <svg {...comunes}>
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "cursando":
      return (
        <svg {...comunes}>
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
          <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />
        </svg>
      );
    case "perfil":
      return (
        <svg {...comunes}>
          <circle cx="12" cy="8.5" r="3.5" />
          <path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5" />
        </svg>
      );
  }
}