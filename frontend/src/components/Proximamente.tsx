// Pantalla para las secciones que todavía no existen.
export default function Proximamente({ titulo, descripcion }: { titulo: string; descripcion: string }) {
  return (
    <section className="flex flex-col items-center gap-3 rounded-3xl bg-superficie px-6 py-10 text-center shadow-sm">
      <span className="rounded-full bg-pizarra px-3 py-1 text-xs font-bold text-pizarra-tinta">Próximamente</span>
      <h2 className="text-lg font-bold">{titulo}</h2>
      <p className="max-w-xs text-sm text-suave">{descripcion}</p>
    </section>
  );
}