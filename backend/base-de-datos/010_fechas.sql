-- Agendu: fechas importantes de cada materia (entregas, lecciones, evaluaciones, presentaciones…)
-- Se ejecuta una sola vez en Supabase: SQL Editor → New query → pegar todo → Run.

create table public.fechas (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid not null references auth.users (id) on delete cascade,
  materia_id  text not null references public.materias (id) on delete cascade,
  tipo        text not null check (tipo in ('entrega', 'leccion', 'evaluacion', 'presentacion', 'otro')),
  titulo      text not null check (char_length(titulo) between 1 and 120),
  fecha       date not null,
  hora        time,
  origen      text not null default 'manual' check (origen in ('manual', 'uv', 'calendario')), -- de dónde vino
  uid_externo text, -- para no traer dos veces la misma fecha de la UV o de otro calendario (etapa 13c)
  creado_en   timestamptz not null default now()
);

create index fechas_usuario_fecha on public.fechas (usuario_id, fecha);

alter table public.fechas enable row level security;

-- Cada alumno ve y cambia solo sus fechas
create policy "Veo mis fechas"   on public.fechas for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Creo mis fechas"  on public.fechas for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "Edito mis fechas" on public.fechas for update to authenticated using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy "Borro mis fechas" on public.fechas for delete to authenticated using ((select auth.uid()) = usuario_id);