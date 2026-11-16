-- Agendu: ficha de cada materia (anotaciones del alumno)
-- Se ejecuta una sola vez en Supabase: SQL Editor → New query → pegar todo → Run.

create table public.fichas_materias (
  usuario_id      uuid not null references auth.users (id) on delete cascade,
  materia_id      text not null references public.materias (id) on delete cascade,
  anotaciones     text check (char_length(anotaciones) <= 2000),
  actualizado_en  timestamptz not null default now(),
  primary key (usuario_id, materia_id)
);

alter table public.fichas_materias enable row level security;

-- Cada alumno ve y cambia solo sus fichas
create policy "Veo mis fichas"    on public.fichas_materias for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Creo mis fichas"   on public.fichas_materias for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "Edito mis fichas"  on public.fichas_materias for update to authenticated using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy "Borro mis fichas"  on public.fichas_materias for delete to authenticated using ((select auth.uid()) = usuario_id);