import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Historia from "@/components/landing/Historia";
import "./landing.css";

export const metadata: Metadata = {
  title: "Agendu · Tu carrera entera, organizada en un solo lugar",
  description:
    "Tu plan de estudios, tus correlativas y tu avance, ya cargados para tu carrera de la UTN FRC. Gratis para siempre; el plan completo suma archivos, calendario de la UV, tareas y parciales en todas tus materias.",
};

// La página de presentación (landing). La app vive en /app; el login, en /login.
export default function Landing() {
  return (
    <div className="lp">
      <header className="lp-top">
        <div className="lp-wrap">
          <Link className="lp-brand" href="/" aria-label="Agendu, inicio">
            <Logo />
            <span>
              agend<b>u</b>
            </span>
          </Link>
          <nav aria-label="Cuenta" className="lp-nav">
            <Link className="lp-btn lp-btn-ghost" href="/login">
              Iniciar sesión
            </Link>
            <Link className="lp-btn lp-btn-primary" href="/login">
              Empezar gratis
            </Link>
          </nav>
        </div>
      </header>

      <main id="inicio">
        <Historia />

        <section className="lp-block">
          <div className="lp-wrap">
            <h2>Pensada para cómo se cursa en la facu</h2>
            <p className="lp-lead">
              Agendu junta en un solo lugar lo que hoy tenés repartido entre planillas, el sistema de la facultad y el
              grupo de WhatsApp.
            </p>
            <div className="lp-features">
              <Funcion titulo="Tu plan, listo" icono="plan">
                Las materias, correlativas y electivas del plan 2023 de tu carrera, con el año y el cuatrimestre en que
                se cursa cada una en la FRC.
              </Funcion>
              <Funcion titulo="Tu avance real" icono="avance">
                Porcentaje de carrera, promedio, electivas que te faltan y qué podés cursar y rendir.
              </Funcion>
              <Funcion titulo="Tus fechas y tus archivos" icono="fechas">
                Parciales, entregas y tareas de cada materia, el calendario de la UV conectado y tus apuntes guardados
                por materia.
              </Funcion>
            </div>
          </div>
        </section>

        <section className="lp-block" id="planes">
          <div className="lp-wrap">
            <h2>Planes</h2>
            <p className="lp-lead">Empezá gratis. Cuando quieras usarla en todas tus materias, pasate al plan completo.</p>
            <div className="lp-plans">
              <article className="lp-plan">
                <h3>Gratis</h3>
                <span className="lp-price">$0</span>
                <p>Para siempre.</p>
                <ul>
                  <li>Tu plan de estudios y tus correlativas</li>
                  <li>Avance, promedio y qué podés cursar y rendir</li>
                  <li>Tareas, parciales y fechas en 1 materia</li>
                  <li>Hasta 7 archivos</li>
                  <li>Conectás la UV y ves cuántas fechas encontramos</li>
                                  <li className="lp-no">Tareas, parciales y fechas en todas tus materias</li>
                  <li className="lp-no">Archivos sin límite de cantidad</li>
                  <li className="lp-no">Traer tus fechas de la UV y mantenerlas al día</li>
                </ul>
              </article>
              <article className="lp-plan lp-best">
                <span className="lp-tag">Todo incluido</span>
                <h3>Completo · mensual</h3>
                <Suspense fallback={<span className="lp-price">…</span>}>
                  <Precio />
                </Suspense>
                <ul>
                  <li>Todo lo del plan gratis</li>
                  <li>Tareas, parciales y fechas en todas tus materias</li>
                  <li>Archivos y apuntes en todas tus materias</li>
                  <li>Tus fechas de la UV, traídas y al día</li>
                </ul>
                <p>Cancelás cuando quieras.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="lp-block" id="empezar">
          <div className="lp-wrap lp-closing">
            <h2>Empezá con tu carrera</h2>
            <p className="lp-lead">Creá tu cuenta, elegí tu carrera y en dos minutos ves cuánto te falta para recibirte.</p>
            <Link className="lp-btn lp-btn-primary" href="/login">
              Crear mi cuenta
            </Link>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap">
          <p className="lp-aviso">Agendu es una aplicación independiente de la universidad.</p>
          <nav aria-label="Legales" className="lp-legales">
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/arrepentimiento">Botón de arrepentimiento</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

// El precio en pesos sale de la tabla "precios" de Supabase (lo actualizás vos).
async function Precio() {
  const supabase = await createClient();
  const { data } = await supabase.from("precios").select("precio_ars").eq("id", "mensual").maybeSingle();
  if (!data) return null;
  return (
    <span className="lp-price">
      ${Number(data.precio_ars).toLocaleString("es-AR", { maximumFractionDigits: 0 })} <small>por mes</small>
    </span>
  );
}

function Funcion({ titulo, icono, children }: { titulo: string; icono: "plan" | "avance" | "fechas"; children: React.ReactNode }) {
  return (
    <article className="lp-feature">
      <div className="lp-ico" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {icono === "plan" && (
            <>
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </>
          )}
          {icono === "avance" && (
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3a9 9 0 0 1 9 9h-9z" />
            </>
          )}
          {icono === "fechas" && (
            <>
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" />
            </>
          )}
        </svg>
      </div>
      <h3>{titulo}</h3>
      <p>{children}</p>
    </article>
  );
}

function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <rect x="24" y="22" width="72" height="84" rx="14" fill="var(--color-acento)" />
      <g stroke="var(--color-tinta)" strokeWidth="7" strokeLinecap="round">
        <path d="M44 12 V30" />
        <path d="M60 12 V30" />
        <path d="M76 12 V30" />
      </g>
      <g stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 56 L60 44 L80 56" />
        <path d="M47 63 V84" />
        <path d="M60 63 V84" />
        <path d="M73 63 V84" />
        <path d="M42 92 H78" />
      </g>
    </svg>
  );
}