-- Agendu: tareas de cada materia
-- Se ejecuta una sola vez en Supabase: SQL Editor → New query → pegar todo → Run.

create table public.tareas (
  id              uuid primary key default gen_random_uuid(),
  usuario_id      uuid not null references auth.users (id) on delete cascade,
  materia_id      text not null references public.materias (id) on delete cascade,
  titulo          text not null check (char_length(titulo) between 1 and 200),
  fecha           date,
  hecha           boolean not null default false,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

create index tareas_usuario_materia on public.tareas (usuario_id, materia_id);

alter table public.tareas enable row level security;

-- Cada alumno ve y cambia solo sus tareas
create policy "Veo mis tareas"   on public.tareas for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Creo mis tareas"  on public.tareas for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "Edito mis tareas" on public.tareas for update to authenticated using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy "Borro mis tareas" on public.tareas for delete to authenticated using ((select auth.uid()) = usuario_id);