# Decisiones

## Producto
- App web responsive, pensada primero para el celular e instalable (PWA).
- Arranque: UTN, Ingeniería en Sistemas, FRC, Plan 2023. Después, las demás ingenierías.
- Sin IA para el alumno: la mayoría ya paga una y Gemini es gratis para estudiantes.
- Login con Google y con mail.

## Estructura y tecnología
- Carpetas: frontend (Next.js), backend (Supabase) y docs.
- Un solo repositorio en GitHub: MayraErrigo/agendu.
- Frontend: Next.js 16 + TypeScript + Tailwind 4. Hosting: Vercel.
- Backend: Supabase (base de datos, login y seguridad por alumno).
- Planes de estudio: un JSON por carrera, plan y regional, cargado con un script.
- La clave secreta de Supabase vive solo en backend/.env.

## Precios (versión 2)
- Freemium: el avance de carrera es gratis; lo diario es pago.
- Mensual USD 6, cuatrimestral USD 20, anual USD 50, cobrados en pesos.
- Prueba de 7 días sin tarjeta, con aviso desde el día 5.