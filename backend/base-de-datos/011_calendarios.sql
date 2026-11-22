-- Agendu: conectar un calendario (UV, Google, Apple u Outlook) para traer fechas
-- Se ejecuta una sola vez en Supabase: SQL Editor → New query → pegar todo → Run.

-- 1. El calendario conectado de cada alumno (uno por alumno). El link es privado: solo lo ve su dueño.
create table public.conexiones_calendario (
  usuario_id       uuid primary key references auth.users (id) on delete cascade,
  origen           text not null check (origen in ('uv', 'google', 'apple', 'outlook')),
  url              text not null check (char_length(url) between 10 and 2000),
  ultima_busqueda  timestamptz,
  ultimo_error     text,
  creado_en        timestamptz not null default now()
);

alter table public.conexiones_calendario enable row level security;

create policy "Veo mi calendario conectado"   on public.conexiones_calendario for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Conecto mi calendario"         on public.conexiones_calendario for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "Actualizo mi calendario"       on public.conexiones_calendario for update to authenticated using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy "Desconecto mi calendario"      on public.conexiones_calendario for delete to authenticated using ((select auth.uid()) = usuario_id);

-- 2. Los eventos que el alumno descartó, para no volver a mostrárselos.
create table public.eventos_descartados (
  usuario_id  uuid not null references auth.users (id) on delete cascade,
  uid         text not null check (char_length(uid) between 1 and 500),
  creado_en   timestamptz not null default now(),
  primary key (usuario_id, uid)
);

alter table public.eventos_descartados enable row level security;

create policy "Veo mis descartados"   on public.eventos_descartados for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Descarto eventos"      on public.eventos_descartados for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "Borro mis descartados" on public.eventos_descartados for delete to authenticated using ((select auth.uid()) = usuario_id);

-- 3. Una misma fecha importada no se puede traer dos veces.
--    (Las fechas cargadas a mano no tienen uid_externo, y no chocan entre sí.)
alter table public.fechas add constraint fechas_uid_unico unique (usuario_id, uid_externo);