-- Agendu: materias del título intermedio (Analista Desarrollador Universitario de Sistemas de Información)
-- Se ejecuta una sola vez en Supabase: SQL Editor → New query → pegar todo → Run.
-- Fuente: correlatividades del Analista, Plan 2023 (UTN).

-- 1. Un tipo nuevo de materia: 'intermedio'. Se ve en su año, pero no suma al avance de la ingeniería.
do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid = 'public.materias'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%tipo%'
  loop
    execute format('alter table public.materias drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.materias
  add constraint materias_tipo_check check (tipo in ('obligatoria', 'electiva', 'intermedio'));

-- 2. Seminario Integrador, 3º año, común a todas las regionales.
insert into public.materias (id, plan_id, numero, nombre, nivel, tipo, integradora, regional_id, creditos, se_dicta)
select 'utn-isi-2023-seminario', 'utn-isi-2023', max(numero) + 1, 'Seminario Integrador', 3, 'intermedio', false, null, null, true
from public.materias
where plan_id = 'utn-isi-2023';

-- 3. Correlativas para cursarlo: Análisis de Sistemas regular;
--    Algoritmos, Sistemas y Procesos de Negocio, Sintaxis y Paradigmas aprobadas.
insert into public.correlativas (materia_id, requiere_id, condicion) values
  ('utn-isi-2023-seminario', 'utn-isi-2023-16', 'regular'),
  ('utn-isi-2023-seminario', 'utn-isi-2023-06', 'aprobada'),
  ('utn-isi-2023-seminario', 'utn-isi-2023-08', 'aprobada'),
  ('utn-isi-2023-seminario', 'utn-isi-2023-13', 'aprobada'),
  ('utn-isi-2023-seminario', 'utn-isi-2023-14', 'aprobada');