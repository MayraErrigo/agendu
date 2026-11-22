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
## Seguridad: un pilar de Agendu

Los estudiantes nos confían sus datos. Por eso, en todo lo que hagamos:

1. **Cada alumno ve solo lo suyo.** Lo controla la base (RLS), no solo la app.
2. **Los secretos nunca salen del servidor.** La clave secreta de Supabase solo en `backend/.env`; nada secreto en el código ni en GitHub.
3. **Desconfiar de todo lo que llega de afuera.** Archivos, links y formularios se revisan en el servidor antes de usarlos.
4. **Pedir lo mínimo.** Solo los datos que la app necesita; nada sensible.
5. **Archivos y links privados.** Links que vencen, nada público.
6. **El alumno decide.** Puede ver, corregir, desconectar y borrar sus datos.
7. **Revisar seguido.** Cada tanto, una etapa de revisión de seguridad.