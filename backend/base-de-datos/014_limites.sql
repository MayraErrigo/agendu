-- Agendu: límites de uso (etapa 14b). Protegen la base, que es compartida por todos, de abusos.
-- Se ejecuta una sola vez en Supabase: SQL Editor → New query → pegar todo → Run.

-- 1. Un control genérico: antes de agregar una fila, cuenta cuántas tiene el alumno
--    (en total, o en un período) y, si llegó al máximo, no la deja guardar.
--    Parámetros del disparador: máximo y, opcional, el período ('1 day', '1 hour'…).
create or replace function public.limitar_cantidad()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  maximo   integer  := tg_argv[0]::integer;
  periodo  interval := nullif(tg_argv[1], '')::interval;
  cantidad integer;
begin
  if new.usuario_id is null then
    return new;
  end if;

  if periodo is null then
    execute format('select count(*) from public.%I where usuario_id = $1', tg_table_name)
      into cantidad using new.usuario_id;
  else
    execute format('select count(*) from public.%I where usuario_id = $1 and creado_en > now() - $2', tg_table_name)
      into cantidad using new.usuario_id, periodo;
  end if;

  if cantidad >= maximo then
    raise exception 'limite_%', tg_table_name using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- Solo la usa la base (como disparador): nadie la puede llamar desde internet.
revoke execute on function public.limitar_cantidad() from public, anon, authenticated;

-- 2. Los límites.
create trigger limitar_tareas
  before insert on public.tareas
  for each row execute function public.limitar_cantidad('1000');

create trigger limitar_fechas
  before insert on public.fechas
  for each row execute function public.limitar_cantidad('1500');

create trigger limitar_materias_propias
  before insert on public.materias_propias
  for each row execute function public.limitar_cantidad('10');

-- Reportes y opiniones (van en la misma tabla): 10 por día.
create trigger limitar_reportes
  before insert on public.reportes
  for each row execute function public.limitar_cantidad('10', '1 day');

-- 3. Registro de acciones que cuestan (por ahora, "Buscar fechas": descarga un calendario de internet).
--    Cada alumno ve y agrega solo los suyos; nadie los puede editar ni borrar (así no se "resetea" el contador).
create table public.uso_acciones (
  id          bigint generated always as identity primary key,
  usuario_id  uuid not null references auth.users (id) on delete cascade,
  accion      text not null check (accion in ('buscar_fechas')),
  creado_en   timestamptz not null default now()
);

create index uso_acciones_usuario on public.uso_acciones (usuario_id, accion, creado_en);

alter table public.uso_acciones enable row level security;

create policy "Veo mi uso"      on public.uso_acciones for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Registro mi uso" on public.uso_acciones for insert to authenticated with check ((select auth.uid()) = usuario_id);