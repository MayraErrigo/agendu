-- Agendu: créditos de electivas
-- Se ejecuta una sola vez en Supabase: SQL Editor → New query → pegar todo → Run.

-- Cuántos créditos vale cada materia (por ahora, solo las electivas)
-- y si se dicta actualmente en su regional.
alter table public.materias
  add column creditos int check (creditos > 0),
  add column se_dicta boolean not null default true;

-- Cuántos créditos de electivas pide cada plan para recibirse.
alter table public.planes
  add column creditos_electivas int check (creditos_electivas > 0);