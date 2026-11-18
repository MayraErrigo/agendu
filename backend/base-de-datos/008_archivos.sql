-- Agendu: archivos de cada materia (Supabase Storage)
-- Se ejecuta una sola vez en Supabase: SQL Editor → New query → pegar todo → Run.

-- 1. Límites de cada alumno (hoy, el plan gratis para todos)
alter table public.perfiles
  add column limite_bytes      bigint not null default 52428800,  -- 50 MB en total
  add column max_archivo_bytes bigint not null default 10485760;  -- 10 MB por archivo

-- 2. Los datos de cada archivo. El archivo en sí va en Storage, en la "ruta".
create table public.archivos (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid not null references auth.users (id) on delete cascade,
  materia_id  text not null references public.materias (id) on delete cascade,
  carpeta     text not null default 'otros', -- una fija (apuntes, resumenes…) o el id de una propia
  nombre      text not null check (char_length(nombre) between 1 and 120),
  extension   text not null check (extension in ('pdf', 'jpg', 'png', 'heic', 'docx', 'xlsx', 'pptx')),
  tamano      bigint not null check (tamano > 0),
  ruta        text not null unique, -- usuario/materia/código.extensión
  estado      text not null default 'pendiente' check (estado in ('pendiente', 'listo')),
  creado_en   timestamptz not null default now()
);

create index archivos_usuario_materia on public.archivos (usuario_id, materia_id);

alter table public.archivos enable row level security;

create policy "Veo mis archivos"   on public.archivos for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "Creo mis archivos"  on public.archivos for insert to authenticated with check ((select auth.uid()) = usuario_id and estado = 'pendiente');
create policy "Edito mis archivos" on public.archivos for update to authenticated using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy "Borro mis archivos" on public.archivos for delete to authenticated using ((select auth.uid()) = usuario_id);

-- 3. El espacio privado en Storage, con tope de 25 MB por archivo y solo los tipos permitidos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'archivos', 'archivos', false, 26214400,
  array[
    'application/pdf', 'image/jpeg', 'image/png', 'image/heic',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
);

-- 4. Permisos en Storage: cada alumno solo toca su carpeta (la primera parte de la ruta es su id).
--    Para subir, además, la app tiene que haber anotado antes el archivo como "pendiente".
create policy "Subo mis archivos" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'archivos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.archivos a
      where a.ruta = objects.name and a.usuario_id = (select auth.uid()) and a.estado = 'pendiente'
    )
  );

create policy "Leo mis archivos" on storage.objects for select to authenticated
  using (bucket_id = 'archivos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Borro mis archivos del storage" on storage.objects for delete to authenticated
  using (bucket_id = 'archivos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 5. Que nadie se pueda subir el límite a sí mismo: desde la app, del perfil solo se pueden
--    cambiar el nombre, la regional y el plan. Los límites los cambiamos nosotros (o, en la
--    versión 2, el pago con Mercado Pago desde el servidor).
revoke update on public.perfiles from authenticated, anon;
grant update (nombre, regional_id, plan_id) on public.perfiles to authenticated;

-- 6. De cada archivo, desde la app solo se puede cambiar el nombre y la carpeta.
revoke update on public.archivos from authenticated, anon;
grant update (nombre, carpeta) on public.archivos to authenticated;

-- 7. Confirmar una subida: toma el tamaño REAL del archivo en Storage (no el que dijo el navegador),
--    revisa los límites del alumno y recién ahí lo marca como listo.
create function public.confirmar_archivo(p_id uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_ruta    text;
  v_usuario uuid;
  v_tamano  bigint;
  v_usado   bigint;
  v_limite  bigint;
  v_maximo  bigint;
begin
  select ruta, usuario_id into v_ruta, v_usuario
  from public.archivos
  where id = p_id and usuario_id = auth.uid() and estado = 'pendiente';
  if v_ruta is null then return 'no_existe'; end if;

  select (metadata ->> 'size')::bigint into v_tamano
  from storage.objects
  where bucket_id = 'archivos' and name = v_ruta;
  if v_tamano is null then return 'no_subido'; end if;

  select limite_bytes, max_archivo_bytes into v_limite, v_maximo from public.perfiles where id = v_usuario;
  select coalesce(sum(tamano), 0) into v_usado from public.archivos where usuario_id = v_usuario and estado = 'listo';

  if v_tamano > v_maximo then return 'muy_grande'; end if;
  if v_usado + v_tamano > v_limite then return 'sin_espacio'; end if;

  update public.archivos set estado = 'listo', tamano = v_tamano where id = p_id;
  return 'ok';
end;
$$;

revoke execute on function public.confirmar_archivo(uuid) from public, anon;
grant execute on function public.confirmar_archivo(uuid) to authenticated;