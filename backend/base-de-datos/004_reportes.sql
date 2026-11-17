-- Agendu: materias que agrega el alumno y reportes de errores del plan
-- Se ejecuta una sola vez en Supabase: SQL Editor → New query → pegar todo → Run.

-- 1. Materias que el alumno agrega porque no figuran en su plan.
--    Son solo suyas: nadie más las ve. Llevan su estado acá mismo.
create table public.materias_propias (
  id              uuid primary key default gen_random_uuid(),
  usuario_id      uuid not null references auth.users (id) on delete cascade,
  plan_id         text not null references public.planes (id) on delete cascade,
  nombre          text not null check (char_length(nombre) between 2 and 120),
  nivel           int  not null check (nivel between 1 and 6),
  tipo            text not null check (tipo in ('obligatoria', 'electiva')),
  creditos        int  check (creditos > 0),
  estado          text not null default 'pendiente' check (estado in ('pendiente', 'cursando', 'regular', 'aprobada')),
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

alter table public.materias_propias enable row level security;

create policy "Veo mis materias propias"   on public.materias_propias for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Creo mis materias propias"  on public.materias_propias for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "Edito mis materias propias" on public.materias_propias for update to authenticated using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy "Borro mis materias propias" on public.materias_propias for delete to authenticated using ((select auth.uid()) = usuario_id);

-- 2. Reportes: lo que nos avisan los alumnos para corregir el plan.
--    El alumno puede crear y ver los suyos; cambiar el estado lo hacemos nosotros desde Supabase.
create table public.reportes (
  id              uuid primary key default gen_random_uuid(),
  usuario_id      uuid references auth.users (id) on delete set null,
  plan_id         text references public.planes (id) on delete set null,
  regional_id     text references public.regionales (id) on delete set null,
  tipo            text not null check (tipo in ('falta_materia', 'error')),
  materia_nombre  text check (char_length(materia_nombre) <= 120),
  detalle         text check (char_length(detalle) <= 1000),
  estado          text not null default 'pendiente' check (estado in ('pendiente', 'incorporado', 'descartado')),
  creado_en       timestamptz not null default now()
);

alter table public.reportes enable row level security;

create policy "Veo mis reportes"  on public.reportes for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Creo mis reportes" on public.reportes for insert to authenticated with check ((select auth.uid()) = usuario_id and estado = 'pendiente');