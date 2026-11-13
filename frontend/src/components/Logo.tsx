// Logo de Agendu: la agenda con anillos y la facultad en la tapa.
export default function Logo({ tamano = 40, conNombre = false }: { tamano?: number; conNombre?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={tamano} height={tamano} viewBox="0 0 120 120" fill="none" aria-hidden="true">
        <rect x="24" y="22" width="72" height="84" rx="14" className="fill-acento" />
        <g className="stroke-tinta" strokeWidth="6" strokeLinecap="round">
          <path d="M44 14 V30" />
          <path d="M60 14 V30" />
          <path d="M76 14 V30" />
        </g>
        <g stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M40 56 L60 44 L80 56" />
          <path d="M47 63 V84" />
          <path d="M60 63 V84" />
          <path d="M73 63 V84" />
          <path d="M42 92 H78" />
        </g>
      </svg>
      {conNombre && (
        <span className="text-[1.6em] font-extrabold tracking-tight">
          agend<span className="text-acento">u</span>
        </span>
      )}
    </div>
  );
}