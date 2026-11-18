import { formatearTamano } from "@/lib/logica/archivos";

// "12 MB de 50 MB usados", con una barrita. Se pone en dorado y en rojo cuando se está llenando.
export default function BarraEspacio({ usado, limite }: { usado: number; limite: number }) {
  const porcentaje = limite ? Math.min(100, Math.round((usado / limite) * 100)) : 0;
  const color = porcentaje >= 90 ? "bg-error" : porcentaje >= 75 ? "bg-arena-tinta" : "bg-acento";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold">Espacio para archivos</span>
        <span className="text-suave">
          {formatearTamano(usado)} de {formatearTamano(limite)}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-bloqueo"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={porcentaje}
        aria-label="Espacio usado"
      >
        <div className={`h-full rounded-full ${color}`} style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  );
}