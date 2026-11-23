-- Agendu: ajustes de seguridad (etapa 14a), según el Security Advisor de Supabase.
-- Se ejecuta una sola vez en Supabase: SQL Editor → New query → pegar todo → Run.

-- 1. Funciones que usa solo la base (disparadores): nadie las puede llamar desde internet.
--    La base las sigue usando igual: al registrarse alguien y al crear una carpeta.
revoke execute on function public.crear_perfil() from public, anon, authenticated;
revoke execute on function public.limitar_carpetas() from public, anon, authenticated;

-- 2. confirmar_archivo: solo con sesión iniciada (la app la llama al subir un archivo,
--    y adentro chequea que el archivo sea del alumno).
revoke execute on function public.confirmar_archivo(uuid) from public, anon;
grant execute on function public.confirmar_archivo(uuid) to authenticated;

-- 3. Las funciones que creemos de acá en adelante arrancan cerradas para quien no tiene sesión.
alter default privileges in schema public revoke execute on functions from public, anon;

-- 4. El catálogo (universidades, planes, materias…) solo se ve con sesión iniciada.
alter policy "Catálogo visible" on public.universidades       to authenticated;
alter policy "Catálogo visible" on public.regionales          to authenticated;
alter policy "Catálogo visible" on public.carreras            to authenticated;
alter policy "Catálogo visible" on public.planes              to authenticated;
alter policy "Catálogo visible" on public.planes_regionales   to authenticated;
alter policy "Catálogo visible" on public.materias            to authenticated;
alter policy "Catálogo visible" on public.materias_regionales to authenticated;
alter policy "Catálogo visible" on public.correlativas        to authenticated;