import { Suspense } from "react";
import BarraNavegacion from "@/components/BarraNavegacion";

// Todo lo que está dentro de /app comparte la barra de navegación de abajo.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <BarraNavegacion />
      </Suspense>
    </>
  );
}