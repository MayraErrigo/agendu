-- Agendu: parciales de cada materia
-- Se ejecuta una sola vez en Supabase: SQL Editor → New query → pegar todo → Run.
--
-- Una fila por alumno y materia. Las notas de cada parcial van juntas en "evaluaciones":
-- [{ "fecha": "2026-05-10", "nota": 8, "recuperatorio": null }, …]
--
-- Cómo se aprueba (cada materia usa las que tiene):
--   minimo              nota mínima en cada parcial (o su recuperatorio) para regularizar
--   promocion_practica  promedio para la promoción práctica (final solo teórico)
--   aprobacion_directa  promedio para la aprobación directa (sin final)

create table public.parciales_materias (
  usuario_id          uuid not null references auth.users (id) on delete cascade,
  materia_id          text not null references public.materias (id) on delete cascade,
  cantidad            int  not null default 2 check (cantidad between 1 and 6),
  tiene_tp            boolean not null default false,
  minimo              int  check (minimo between 1 and 10),
  promocion_practica  int  check (promocion_practica between 1 and 10),
  aprobacion_directa  int  check (aprobacion_directa between 1 and 10),
  evaluaciones        jsonb not null default '[]'::jsonb,
  tp                  jsonb,
  actualizado_en      timestamptz not null default now(),
  primary key (usuario_id, materia_id)
);

alter table public.parciales_materias enable row level security;

-- Cada alumno ve y cambia solo sus parciales
create policy "Veo mis parciales"   on public.parciales_materias for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Creo mis parciales"  on public.parciales_materias for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "Edito mis parciales" on public.parciales_materias for update to authenticated using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy "Borro mis parciales" on public.parciales_materias for delete to authenticated using ((select auth.uid()) = usuario_id);