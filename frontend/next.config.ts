import type { NextConfig } from "next";

// Encabezados de seguridad: instrucciones que la app le da al navegador con cada página.
const esProduccion = process.env.NODE_ENV === "production";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : "";

// Política de contenido: de dónde puede cargar cosas la app y a dónde se puede conectar.
const politicaDeContenido = [
  "default-src 'self'",
  // Next.js necesita scripts propios en la página; en desarrollo también 'unsafe-eval' (recarga en vivo).
  `script-src 'self' 'unsafe-inline'${esProduccion ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseUrl}`,
  "font-src 'self'",
  // Solo Agendu, Supabase y el servicio de contraseñas filtradas.
  `connect-src 'self' ${supabaseUrl} wss://${supabaseHost} https://api.pwnedpasswords.com${esProduccion ? "" : " ws:"}`,
  "frame-ancestors 'none'", // nadie puede mostrar Agendu dentro de otra página
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const encabezados = [
  { key: "Content-Security-Policy", value: politicaDeContenido },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  ...(esProduccion ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/(.*)", headers: encabezados }];
  },
};

export default nextConfig;