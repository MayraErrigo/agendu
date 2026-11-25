-- 019 · PPS de Ingeniería Metalúrgica como requisito, sin requisitos conocidos.
-- La Ord. 1950 pide 150 horas, pero el CET de la FRC no dice qué hace falta para empezarla.
-- Se ejecuta DESPUÉS de cargar el plan de Metalúrgica (npm run cargar-plan). Se puede correr más de una vez.

-- 1. Si la PPS se empieza con los requisitos de Proyecto Final (así es en todos los planes, salvo que se diga otra cosa).
alter table public.planes add column if not exists pps_requisitos_pf boolean not null default true;

-- 2. Metalúrgica: 150 horas, requisitos desconocidos.
update public.planes set pps_horas = 150, pps_requisitos_pf = false where id = 'utn-met-2023';