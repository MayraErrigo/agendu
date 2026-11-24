-- Agendu: Gestión Industrial, la materia del título intermedio de Ingeniería Industrial
-- (Técnico Universitario en Administración, Producción y Gestión Industrial).
-- Se ejecuta UNA sola vez, DESPUÉS de cargar el plan de Industrial (npm run cargar-plan).
-- Fuente: correlatividades de la Tecnicatura, Ord. 1933 CSU.

-- 1. La materia: 3er año, del título intermedio (no suma al avance de la ingeniería).
insert into public.materias (id, plan_id, numero, nombre, nivel, tipo, integradora, regional_id, creditos, se_dicta)
select 'utn-ind-2023-gestion', 'utn-ind-2023', max(numero) + 1, 'Gestión Industrial', 3, 'intermedio', false, null, null, true
from public.materias
where plan_id = 'utn-ind-2023';

-- 2. Correlativas para cursarla: Administración General, Probabilidad y Estadística, Economía General
--    e Informática II regulares; Análisis Matemático I, Sistemas de Representación, Informática I,
--    Pensamiento Sistémico, Álgebra y Geometría Analítica e Ingeniería y Sociedad aprobadas.
insert into public.correlativas (materia_id, requiere_id, condicion) values
  ('utn-ind-2023-gestion', 'utn-ind-2023-10', 'regular'),
  ('utn-ind-2023-gestion', 'utn-ind-2023-11', 'regular'),
  ('utn-ind-2023-gestion', 'utn-ind-2023-14', 'regular'),
  ('utn-ind-2023-gestion', 'utn-ind-2023-15', 'regular'),
  ('utn-ind-2023-gestion', 'utn-ind-2023-01', 'aprobada'),
  ('utn-ind-2023-gestion', 'utn-ind-2023-03', 'aprobada'),
  ('utn-ind-2023-gestion', 'utn-ind-2023-04', 'aprobada'),
  ('utn-ind-2023-gestion', 'utn-ind-2023-05', 'aprobada'),
  ('utn-ind-2023-gestion', 'utn-ind-2023-07', 'aprobada'),
  ('utn-ind-2023-gestion', 'utn-ind-2023-08', 'aprobada');