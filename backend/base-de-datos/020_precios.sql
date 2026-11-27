-- 020 · Precio del plan completo, en pesos.
-- Lo actualizás vos cuando quieras:
--   update public.precios set precio_ars = 16999, actualizado_en = now() where id = 'mensual';
-- La landing lo lee y lo muestra. Más adelante lo usa también el cobro con Mercado Pago.
-- Se puede correr más de una vez.

create table if not exists public.precios (
  id              text primary key,                                -- 'mensual'
  precio_ars      numeric(12, 2) not null check (precio_ars > 0),  -- precio por mes, en pesos
  actualizado_en  timestamptz not null default now()
);

alter table public.precios enable row level security;

-- Cualquiera puede ver el precio (la landing se ve sin iniciar sesión). Nadie lo cambia desde la app.
drop policy if exists "Cualquiera ve los precios" on public.precios;
create policy "Cualquiera ve los precios" on public.precios for select to anon, authenticated using (true);
grant select on public.precios to anon, authenticated;

insert into public.precios (id, precio_ars)
values ('mensual', 16999)
on conflict (id) do nothing;