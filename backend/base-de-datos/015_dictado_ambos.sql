-- Agendu: materias que se pueden cursar en cualquiera de los dos cuatrimestres.
-- Se ejecuta una sola vez en Supabase: SQL Editor → New query → pegar todo → Run.
-- '1c-2c' y '2c-1c': se dicta en los dos cuatrimestres (el primero es el principal).

do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid = 'public.materias_regionales'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%dictado%'
  loop
    execute format('alter table public.materias_regionales drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.materias_regionales
  add constraint materias_regionales_dictado_check check (dictado in ('anual', '1c', '2c', '1c-2c', '2c-1c'));