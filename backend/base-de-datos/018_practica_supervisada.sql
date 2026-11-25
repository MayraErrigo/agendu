-- 018 · Práctica Profesional Supervisada (PPS) como requisito para recibirse.
-- En Química, Sistemas, Mecánica e Industrial el CET de la FRC la pone como condición, no como materia:
-- se puede empezar con los mismos requisitos que para cursar Proyecto Final.
-- (En Eléctrica, Civil y Electrónica va como materia del plan: no usan esto.)
-- Se puede correr más de una vez.

-- 1. Horas de PPS de cada plan (si el plan la tiene como requisito).
alter table public.planes add column if not exists pps_horas int;
alter table public.planes drop constraint if exists planes_pps_horas_check;
alter table public.planes add constraint planes_pps_horas_check check (pps_horas > 0);

update public.planes set pps_horas = 200 where id in ('utn-isi-2023', 'utn-ind-2023');
update public.planes set pps_horas = 150 where id in ('utn-iq-2023', 'utn-mec-2023');

-- 2. En qué está cada alumno con su PPS.
alter table public.perfiles add column if not exists pps_estado text not null default 'pendiente';
alter table public.perfiles drop constraint if exists perfiles_pps_estado_check;
alter table public.perfiles
  add constraint perfiles_pps_estado_check check (pps_estado in ('pendiente', 'haciendo', 'aprobada'));

-- 3. El alumno puede cambiar solo su estado de PPS (las políticas ya lo limitan a su propio perfil).
grant update (pps_estado) on public.perfiles to authenticated;