"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

// La historia con scroll de la landing: la agenda se abre, salen las materias,
// arman el mapa de la carrera y se llena el anillo de avance.
// Si la persona pidió menos movimiento en su celular, se muestra todo quieto.

const MATERIAS: [string, Estado][] = [
  ["Análisis I", "aprobada"], ["Álgebra", "aprobada"], ["Física I", "aprobada"], ["Química General", "aprobada"], ["Algoritmos", "aprobada"],
  ["Estabilidad", "aprobada"], ["Análisis II", "cursando"], ["Electrotecnia", "regular"], ["Termodinámica", "disponible"], ["Topografía", "disponible"],
  ["Probabilidad", "disponible"], ["Economía", "disponible"], ["Circuitos", "bloqueada"], ["Bases de Datos", "bloqueada"], ["Hormigón", "bloqueada"],
  ["Fluidos", "bloqueada"], ["Máquinas", "bloqueada"], ["Op. Unitarias", "bloqueada"], ["Inv. Operativa", "bloqueada"], ["Proyecto Final", "bloqueada"],
];
type Estado = "aprobada" | "regular" | "cursando" | "disponible" | "bloqueada";

const PORCENTAJE = 31;
const CIRCUNFERENCIA = 163.4;

// Cada texto aparece entre "entra" y "sale" (de 0 a 1, según cuánto se scrolleó).
const TEXTOS = [
  { entra: 0, sale: 0.11 },
  { entra: 0.15, sale: 0.36 },
  { entra: 0.39, sale: 0.56 },
  { entra: 0.59, sale: 0.74 },
  { entra: 0.77, sale: 0.88 },
  { entra: 0.91, sale: 2 },
];

const limitar = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const tramo = (p: number, a: number, b: number) => limitar((p - a) / (b - a));
const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mezclar = (a: number, b: number, t: number) => a + (b - a) * t;

export default function Historia() {
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const story = raiz.current;
    if (!story) return;
    const $ = <T extends Element>(sel: string) => story.querySelector(sel) as T;
    const escena = $<HTMLDivElement>(".lp-scene");
    const agenda = $<HTMLDivElement>(".lp-agenda");
    const tapa = $<HTMLDivElement>(".lp-cover");
    const avance = $<HTMLDivElement>(".lp-progress");
    const arco = $<SVGCircleElement>(".lp-arc");
    const numero = $<HTMLSpanElement>(".lp-num");
    const pista = $<HTMLDivElement>(".lp-hint");
    const pistaTexto = $<HTMLSpanElement>(".lp-hint-text");
    const textos = Array.from(story.querySelectorAll<HTMLDivElement>(".lp-cap"));
    const tarjetas = Array.from(story.querySelectorAll<HTMLDivElement>(".lp-card"));
    const destino: { g: [number, number]; s: [number, number, number] }[] = [];
    let ultimaPista = "";

    const quieto = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (quieto) story.classList.add("lp-reduced");

    function acomodar() {
      const W = escena.clientWidth;
      const H = escena.clientHeight;
      const cols = W < 520 ? 4 : 5;
      const filas = Math.ceil(tarjetas.length / cols);
      const gap = W < 520 ? 8 : 12;
      const anchoGrilla = Math.min(W - 16, 760);
      const cw = Math.floor((anchoGrilla - gap * (cols - 1)) / cols);
      const ch = W < 520 ? 34 : 40;
      const altoGrilla = filas * ch + (filas - 1) * gap;
      const offY = Math.min(40, Math.max(0, (H - altoGrilla) / 2 - 70));
      tarjetas.forEach((el, i) => {
        el.style.width = `${cw}px`;
        el.style.height = `${ch}px`;
        el.style.marginLeft = `${-cw / 2}px`;
        el.style.marginTop = `${-ch / 2}px`;
        const col = i % cols;
        const fila = Math.floor(i / cols);
        const gx = (col - (cols - 1) / 2) * (cw + gap);
        const gy = (fila - (filas - 1) / 2) * (ch + gap) + offY;
        const ang = i * 2.39996;
        const rad = Math.min(W, H) * (0.3 + (0.18 * ((i * 7) % 10)) / 10);
        const sx = Math.max(-W / 2 + cw / 2, Math.min(W / 2 - cw / 2, Math.cos(ang) * rad * 1.35));
        const sy = Math.max(-H / 2 + ch / 2, Math.min(H / 2 - ch / 2, Math.sin(ang) * rad * 0.85));
        destino[i] = { g: [gx, gy], s: [sx, sy, ((i * 53) % 40) - 20] };
      });
      const pw = avance.offsetWidth || 190;
      const ph = avance.offsetHeight || 84;
      const arribaGrilla = H / 2 - altoGrilla / 2 + offY;
      avance.style.left = `${W / 2 - pw / 2}px`;
      avance.style.top = `${Math.max(4, arribaGrilla - ph - 16)}px`;
    }

    function dibujar(p: number) {
      // 1. La agenda se abre
      const a = suave(tramo(p, 0.06, 0.2));
      tapa.style.transform = `rotateY(${-168 * a}deg)`;
      // 2. Salen las materias  3. Se acomodan en el mapa
      const fundido = suave(tramo(p, 0.4, 0.52));
      agenda.style.opacity = String(1 - fundido);
      agenda.style.transform = `translateY(${fundido * 30}px) scale(${1 - 0.35 * fundido})`;

      const d = tramo(p, 0.6, 0.72);
      const e = tramo(p, 0.77, 0.86);
      tarjetas.forEach((el, i) => {
        const b = suave(tramo(p, 0.16 + i * 0.006, 0.3 + i * 0.006));
        const c = suave(tramo(p, 0.38 + i * 0.004, 0.52 + i * 0.004));
        const { s, g } = destino[i];
        const x = mezclar(mezclar(0, s[0], b), g[0], c);
        const y = mezclar(mezclar(0, s[1], b), g[1], c);
        const r = mezclar(mezclar(0, s[2], b), 0, c);
        const sc = mezclar(0.3, 1, b);
        el.style.opacity = String(b);
        el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${r.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
        const encendida = el.dataset.estado === "aprobada" ? d > i / 7 : e > 0.15 + (i % 7) * 0.08;
        el.classList.toggle("lp-on", encendida);
      });

      // 4. Se llena el anillo de avance
      const dr = suave(d);
      avance.style.opacity = String(tramo(p, 0.58, 0.62));
      avance.style.transform = `translateY(${(1 - tramo(p, 0.58, 0.64)) * 12}px)`;
      arco.setAttribute("stroke-dasharray", `${((CIRCUNFERENCIA * PORCENTAJE) / 100) * dr} ${CIRCUNFERENCIA}`);
      numero.textContent = `${Math.round(PORCENTAJE * dr)}%`;

      // Textos
      textos.forEach((cap, k) => {
        const { entra, sale } = TEXTOS[k];
        const o = k === 0 ? 1 - tramo(p, sale - 0.04, sale) : Math.min(tramo(p, entra, entra + 0.04), 1 - tramo(p, sale - 0.04, sale));
        cap.style.opacity = String(o);
        cap.style.transform = `translateY(${(1 - o) * 14}px)`;
        cap.style.pointerEvents = o > 0.5 ? "auto" : "none";
      });
      const mensaje = p < 0.08 ? "Deslizá hacia abajo para empezar" : "Seguí deslizando";
      if (mensaje !== ultimaPista) {
        pistaTexto.textContent = mensaje;
        ultimaPista = mensaje;
      }
      pista.style.opacity = String(1 - tramo(p, 0.88, 0.92));
    }

    function avanceDelScroll() {
      const r = story!.getBoundingClientRect();
      const total = story!.offsetHeight - window.innerHeight;
      return total > 0 ? limitar(-r.top / total) : 0;
    }

    let esperando = false;
    function alScrollear() {
      if (esperando) return;
      esperando = true;
      requestAnimationFrame(() => {
        esperando = false;
        dibujar(avanceDelScroll());
      });
    }
    function alCambiarTamano() {
      acomodar();
      dibujar(quieto ? 0.9 : avanceDelScroll());
    }

    acomodar();
    dibujar(quieto ? 0.9 : avanceDelScroll());
    if (!quieto) window.addEventListener("scroll", alScrollear, { passive: true });
    window.addEventListener("resize", alCambiarTamano);
    return () => {
      window.removeEventListener("scroll", alScrollear);
      window.removeEventListener("resize", alCambiarTamano);
    };
  }, []);

  return (
    <div className="lp-story" ref={raiz}>
      <div className="lp-stage">
        <div className="lp-captions">
          <div className="lp-cap lp-first">
            <span className="lp-eyebrow">Para estudiantes de la UTN</span>
            <h1>Tu carrera entera, organizada en un solo lugar</h1>
            <p>Elegí tu carrera y en dos minutos ves cuánto te falta para recibirte.</p>
          </div>
          <div className="lp-cap">
            <span className="lp-eyebrow">Tu plan de estudios</span>
            <h2>Todas tus materias, ya cargadas</h2>
            <p>Elegís tu universidad, carrera y plan. No tenés que armar nada desde cero.</p>
          </div>
          <div className="lp-cap">
            <span className="lp-eyebrow">El mapa de tu carrera</span>
            <h2>Año por año, con sus correlativas</h2>
            <p>Cada materia en su lugar, como en el plan oficial.</p>
          </div>
          <div className="lp-cap">
            <span className="lp-eyebrow">Tu avance</span>
            <h2>Mirá cuánto te falta para recibirte</h2>
            <p>Marcás lo que aprobaste y ves tu porcentaje y tu promedio al instante.</p>
          </div>
          <div className="lp-cap">
            <span className="lp-eyebrow">Correlativas resueltas</span>
            <h2>Sabé qué podés cursar y qué podés rendir</h2>
            <p>Las materias habilitadas se marcan solas cuando cumplís las correlativas.</p>
          </div>
          <div className="lp-cap">
            <h2>Empezá gratis</h2>
            <p>Tu plan, tus correlativas y tu avance son gratis para siempre.</p>
            <Link className="lp-btn lp-btn-primary" href="/login">
              Crear mi cuenta
            </Link>
          </div>
        </div>

        <div className="lp-scene" aria-hidden="true">
          <div className="lp-agenda">
            <div className="lp-back" />
            <div className="lp-pages">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="lp-cover">
              <svg viewBox="0 0 120 120" fill="none">
                <g stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M30 52 L60 34 L90 52" />
                  <path d="M40 62 V88" />
                  <path d="M60 62 V88" />
                  <path d="M80 62 V88" />
                  <path d="M32 98 H88" />
                </g>
              </svg>
            </div>
            <div className="lp-rings">
              <i />
              <i />
              <i />
            </div>
          </div>
          {MATERIAS.map(([nombre, estado]) => (
            <div key={nombre} className="lp-card" data-estado={estado}>
              <i className="lp-dot" />
              <span>{nombre}</span>
            </div>
          ))}
          <div className="lp-progress">
            <svg viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="var(--color-acento-claro)" strokeWidth="7" />
              <circle
                className="lp-arc"
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="var(--color-acento)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`0 ${CIRCUNFERENCIA}`}
                transform="rotate(-90 32 32)"
              />
            </svg>
            <div>
              <span className="lp-num">0%</span>
              <small>de tu carrera</small>
            </div>
          </div>
        </div>
        <div className="lp-hint">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14" />
            <path d="M6 13l6 6 6-6" />
          </svg>
          <span className="lp-hint-text">Deslizá hacia abajo para empezar</span>
        </div>
      </div>
    </div>
  );
}