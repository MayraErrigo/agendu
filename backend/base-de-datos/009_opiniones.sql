-- Agendu: opiniones de los alumnos (van en la misma tabla que los reportes)
-- Se ejecuta una sola vez en Supabase: SQL Editor → New query → pegar todo → Run.

-- 1. La tabla de reportes acepta un tipo nuevo: "opinion".
alter table public.reportes drop constraint if exists reportes_tipo_check;
alter table public.reportes add constraint reportes_tipo_check
  check (tipo in ('falta_materia', 'error', 'opinion'));

-- 2. De qué se trata la opinión.
alter table public.reportes add column categoria text
  check (categoria in ('me_gusta', 'no_entendi', 'me_falta', 'otra'));