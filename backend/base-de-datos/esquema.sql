-- Agendu: esquema inicial de la base de datos
-- Se ejecuta una sola vez en Supabase: SQL Editor → New query → pegar todo → Run.

-- ============================================================
-- Catálogo: universidades, regionales, carreras, planes y materias.
-- Lo leen todos; solo se modifica con el script de carga (clave secreta).
-- ============================================================

create table public.universidades (
  id      text primary key,          -- ej: 'utn'
  nombre  text not null,
  sigla   text not null
);

create table public.regionales (
  id              text primary key,  -- ej: 'utn-frc'
  universidad_id  text not null references public.universidades (id),
  nombre          text not null,
  sigla           text not null
);

create table public.carreras (
  id              text primary key,  -- ej: 'utn-isi'
  universidad_id  text not null references public.universidades (id),
  nombre          text not null
);

create table public.planes (
  id               text primary key, -- ej: 'utn-isi-2023'
  carrera_id       text not null references public.carreras (id),
  nombre           text not null,    -- ej: 'Plan 2023'
  anio             int  not null,
  ordenanzas       text,             -- de dónde salen los datos
  horas_electivas  int,
  vigente          boolean not null default true
);

-- Qué regionales dictan cada plan
create table public.planes_regionales (
  plan_id      text not null references public.planes (id) on delete cascade,
  regional_id  text not null references public.regionales (id) on delete cascade,
  primary key (plan_id, regional_id)
);

create table public.materias (
  id           text primary key,     -- ej: 'utn-isi-2023-09'
  plan_id      text not null references public.planes (id) on delete cascade,
  numero       int  not null,        -- número de la materia en el plan oficial
  nombre       text not null,
  nivel        int  not null check (nivel between 1 and 6),
  tipo         text not null default 'obligatoria' check (tipo in ('obligatoria', 'electiva')),
  integradora  boolean not null default false,
  regional_id  text references public.regionales (id), -- vacío = materia común a todas las regionales
  unique (plan_id, numero)
);

-- Lo que cambia por regional: nivel y si se dicta anual o por cuatrimestre
create table public.materias_regionales (
  materia_id   text not null references public.materias (id) on delete cascade,
  regional_id  text not null references public.regionales (id) on delete cascade,
  nivel        int check (nivel between 1 and 6),
  dictado      text check (dictado in ('anual', '1c', '2c')),
  primary key (materia_id, regional_id)
);

-- Correlativas para cursar. Para rendir, todas tienen que estar aprobadas.
create table public.correlativas (
  materia_id   text not null references public.materias (id) on delete cascade,
  requiere_id  text not null references public.materias (id) on delete cascade,
  condicion    text not null check (condicion in ('regular', 'aprobada')),
  primary key (materia_id, requiere_id),
  check (materia_id <> requiere_id)
);

-- ============================================================
-- Datos de cada alumno. Cada uno ve y cambia solo lo suyo.
-- ============================================================

create table public.perfiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  nombre       text,
  regional_id  text references public.regionales (id),
  plan_id      text references public.planes (id),
  creado_en    timestamptz not null default now()
);

create table public.estados_materias (
  usuario_id         uuid not null references auth.users (id) on delete cascade,
  materia_id         text not null references public.materias (id) on delete cascade,
  estado             text not null check (estado in ('pendiente', 'cursando', 'regular', 'aprobada')),
  nota               numeric(4, 2) check (nota between 1 and 10),
  fecha              date,          -- fecha de aprobación
  fecha_regularidad  date,
  actualizado_en     timestamptz not null default now(),
  primary key (usuario_id, materia_id)
);

-- ============================================================
-- Seguridad (Row Level Security)
-- ============================================================

alter table public.universidades       enable row level security;
alter table public.regionales          enable row level security;
alter table public.carreras            enable row level security;
alter table public.planes              enable row level security;
alter table public.planes_regionales   enable row level security;
alter table public.materias            enable row level security;
alter table public.materias_regionales enable row level security;
alter table public.correlativas        enable row level security;
alter table public.perfiles            enable row level security;
alter table public.estados_materias    enable row level security;

-- Catálogo: cualquiera puede leerlo
create policy "Catálogo visible" on public.universidades       for select to anon, authenticated using (true);
create policy "Catálogo visible" on public.regionales          for select to anon, authenticated using (true);
create policy "Catálogo visible" on public.carreras            for select to anon, authenticated using (true);
create policy "Catálogo visible" on public.planes              for select to anon, authenticated using (true);
create policy "Catálogo visible" on public.planes_regionales   for select to anon, authenticated using (true);
create policy "Catálogo visible" on public.materias            for select to anon, authenticated using (true);
create policy "Catálogo visible" on public.materias_regionales for select to anon, authenticated using (true);
create policy "Catálogo visible" on public.correlativas        for select to anon, authenticated using (true);

-- Perfil: solo el dueño
create policy "Veo mi perfil"       on public.perfiles for select to authenticated using ((select auth.uid()) = id);
create policy "Edito mi perfil"     on public.perfiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Estados de materias: solo el dueño
create policy "Veo mis materias"     on public.estados_materias for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Cargo mis materias"   on public.estados_materias for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "Edito mis materias"   on public.estados_materias for update to authenticated using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy "Borro mis materias"   on public.estados_materias for delete to authenticated using ((select auth.uid()) = usuario_id);

-- ============================================================
-- Al registrarse un alumno, se le crea su perfil automáticamente
-- ============================================================

create function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'));
  return new;
end;
$$;

create trigger al_registrarse
  after insert on auth.users
  for each row execute function public.crear_perfil();
