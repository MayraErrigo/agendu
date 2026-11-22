import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import { MAIL_CONTACTO } from "@/lib/contacto";

export const metadata: Metadata = {
  title: "Política de privacidad · Agendu",
};

const ACTUALIZADA = "22 de noviembre de 2026";

// Política de privacidad: qué datos guarda Agendu, para qué y cómo pedir que se borren.
export default function PrivacidadPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-8 px-6 pb-16 pt-12">
      <Link href="/login" aria-label="Ir a Agendu">
        <Logo tamano={40} conNombre />
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">Política de privacidad</h1>
        <p className="text-sm text-suave">Última actualización: {ACTUALIZADA}</p>
      </header>

      <Seccion titulo="Qué es Agendu">
        <p>
          Agendu es una app para que estudiantes universitarios organicen su carrera: su plan de estudios, el avance, las
          correlativas, las notas, las tareas y los archivos de cada materia. Esta página explica qué datos guardamos,
          para qué y qué podés hacer con ellos.
        </p>
      </Seccion>

      <Seccion titulo="Qué datos guardamos">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Datos de tu cuenta:</strong> tu nombre y tu mail. Si entrás con Google, los recibimos de Google; no
            recibimos tu contraseña de Google.
          </li>
          <li>
            <strong>Tu carrera:</strong> la universidad, la facultad regional, la carrera y el plan que elegís.
          </li>
          <li>
            <strong>Lo que cargás:</strong> el estado de tus materias, notas, fechas, notas importantes, tareas,
            parciales, materias que agregás y reportes que nos mandás.
          </li>
          <li>
            <strong>Tus archivos:</strong> los apuntes, resúmenes y demás archivos que subís.
          </li>
                    <li>
            <strong>Tu calendario conectado (si lo conectás):</strong> el link del calendario de la UV, Google, Apple u
            Outlook que pegás, para buscar tus fechas cuando vos lo pedís. Solo leemos las fechas: nunca escribimos ni
            cambiamos nada en ese calendario, y solo traemos las que elegís. El link funciona como una clave: no lo
            mostramos entero en la app ni lo compartimos con nadie. Podés desconectarlo cuando quieras, y lo borramos en
            el momento.
          </li>
        </ul>
        <p>No pedimos datos sensibles (salud, religión, opiniones políticas, etc.) ni datos de tarjetas.</p>
      </Seccion>

      <Seccion titulo="Para qué los usamos">
        <p>
          Solo para que la app funcione: mostrarte tu avance, calcular qué podés cursar y rendir, y guardar lo que cargás.
          Los reportes que nos mandás los usamos para corregir los planes de estudio.
        </p>
        <p>
          <strong>No vendemos ni compartimos tus datos</strong> con nadie para publicidad ni para ningún otro fin.
        </p>
      </Seccion>

      <Seccion titulo="Quién puede verlos">
        <p>
          Tus datos y tus archivos son <strong>privados</strong>: solo vos los ves. Otros usuarios no tienen acceso. Los
          links para abrir tus archivos se generan cada vez y vencen a la hora.
        </p>
      </Seccion>

      <Seccion titulo="Dónde se guardan">
        <p>Usamos estos servicios para que Agendu funcione:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Supabase:</strong> la base de datos, los archivos y el inicio de sesión.
          </li>
          <li>
            <strong>Vercel:</strong> donde funciona la app.
          </li>
          <li>
            <strong>Google:</strong> solo si elegís entrar con tu cuenta de Google.
          </li>
        </ul>
        <p>
          Estos servicios pueden tener sus servidores fuera de Argentina. Al usar Agendu, aceptás que tus datos se guarden
          ahí, con las medidas de seguridad que ofrecen.
        </p>
      </Seccion>

      <Seccion titulo="Cookies">
        <p>
          Usamos solo las cookies necesarias para mantener tu sesión iniciada. No usamos cookies de publicidad ni de
          seguimiento.
        </p>
      </Seccion>

      <Seccion titulo="Cuánto tiempo los guardamos">
        <p>
          Mientras tengas tu cuenta. Si pedís que la borremos, eliminamos tu cuenta, tus datos y tus archivos dentro de
          los 30 días.
        </p>
      </Seccion>

      <Seccion titulo="Tus derechos">
        <p>
          Podés pedirnos en cualquier momento <strong>ver, corregir o borrar</strong> tus datos, o borrar tu cuenta
          completa. Escribinos a{" "}
          <a href={`mailto:${MAIL_CONTACTO}`} className="font-semibold text-acento hover:underline">
            {MAIL_CONTACTO}
          </a>{" "}
          desde el mail con el que te registraste.
        </p>
        <p className="text-sm text-suave">
          La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley N.º 25.326, tiene
          la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos
          por incumplimiento de las normas vigentes en materia de protección de datos personales.
        </p>
      </Seccion>

      <Seccion titulo="Cambios en esta política">
        <p>
          Si cambiamos algo importante, lo vamos a avisar en la app. La fecha de arriba indica la última actualización.
        </p>
      </Seccion>

      <Seccion titulo="Contacto">
        <p>
          Por cualquier consulta:{" "}
          <a href={`mailto:${MAIL_CONTACTO}`} className="font-semibold text-acento hover:underline">
            {MAIL_CONTACTO}
          </a>
        </p>
      </Seccion>

      <Link href="/login" className="text-sm font-semibold text-acento hover:underline">
        ← Volver a Agendu
      </Link>
    </main>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 leading-relaxed">
      <h2 className="text-lg font-bold">{titulo}</h2>
      {children}
    </section>
  );
}