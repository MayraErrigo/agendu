-- Agendu: carpetas propias de cada materia (las 5 fijas no se guardan: están en el código)
-- Se ejecuta una sola vez en Supabase: SQL Editor → New query → pegar todo → Run.

create table public.carpetas (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid not null references auth.users (id) on delete cascade,
  materia_id  text not null references public.materias (id) on delete cascade,
  nombre      text not null check (char_length(nombre) between 1 and 40),
  creado_en   timestamptz not null default now()
);

create index carpetas_usuario_materia on public.carpetas (usuario_id, materia_id);

alter table public.carpetas enable row level security;

-- Cada alumno ve y cambia solo sus carpetas
create policy "Veo mis carpetas"   on public.carpetas for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Creo mis carpetas"  on public.carpetas for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "Edito mis carpetas" on public.carpetas for update to authenticated using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy "Borro mis carpetas" on public.carpetas for delete to authenticated using ((select auth.uid()) = usuario_id);

-- Máximo 5 carpetas propias por alumno y materia (la app ya lo controla; esto es por las dudas).
create function public.limitar_carpetas() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if (select count(*) from public.carpetas
      where usuario_id = new.usuario_id and materia_id = new.materia_id) >= 5 then
    raise exception 'Máximo 5 carpetas propias por materia';
  end if;
  return new;
end;
$$;

create trigger antes_de_crear_carpeta
  before insert on public.carpetas
  for each row execute function public.limitar_carpetas();