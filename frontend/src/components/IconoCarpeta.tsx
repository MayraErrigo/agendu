// Ícono de carpeta, como el de Windows. Amarilla para las fijas, verde para las propias.
export default function IconoCarpeta({ propia = false, tamano = 56 }: { propia?: boolean; tamano?: number }) {
  const atras = propia ? "#2F5A50" : "#D9A63A";
  const frente = propia ? "#3E6B62" : "#F2C14E";
  const brillo = propia ? "#5C8A80" : "#F8D77E";

  return (
    <svg width={tamano} height={tamano} viewBox="0 0 64 64" aria-hidden="true">
      {/* Parte de atrás con la pestaña */}
      <path d="M6 16a4 4 0 0 1 4-4h14l6 6h24a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill={atras} />
      {/* Hoja que asoma */}
      <rect x="12" y="20" width="40" height="14" rx="2" fill="#FFFFFF" opacity="0.9" />
      {/* Frente */}
      <path d="M6 28a4 4 0 0 1 4-4h44a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill={frente} />
      <path d="M10 28h44" stroke={brillo} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}