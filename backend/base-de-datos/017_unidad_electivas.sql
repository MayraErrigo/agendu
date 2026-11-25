-- 017 · Electivas con decimales y con su unidad (créditos u horas).
-- Algunas carreras cuentan las electivas en horas y con medios (Mecánica: 1,5 o 2 horas).
-- Se puede correr más de una vez.

-- 1. Créditos con un decimal (1,5). Los que ya están (2, 6, 22…) quedan igual.
alter table public.materias          alter column creditos           type numeric(4,1);
alter table public.materias_propias  alter column creditos           type numeric(4,1);
alter table public.planes            alter column creditos_electivas type numeric(4,1);

-- 2. En qué unidad cuenta cada plan sus electivas.
alter table public.planes
  add column if not exists unidad_electivas text not null default 'creditos';

alter table public.planes drop constraint if exists planes_unidad_electivas_check;
alter table public.planes
  add constraint planes_unidad_electivas_check check (unidad_electivas in ('creditos', 'horas'));

-- 3. Civil y Mecánica cuentan en horas.
update public.planes set unidad_electivas = 'horas' where id in ('utn-civ-2023', 'utn-mec-2023');