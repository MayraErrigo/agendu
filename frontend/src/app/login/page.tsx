import { Suspense } from "react";
import FormularioLogin from "./FormularioLogin";

// La pantalla de login. El formulario lee la dirección (por si volvemos con un error),
// por eso va dentro de <Suspense>, como pide Next.js 16.
export default function LoginPage() {
  return (
    <Suspense>
      <FormularioLogin />
    </Suspense>
  );
}