-- 021 · Botón de arrepentimiento (Ley 24.240 de Defensa del Consumidor y Disposición 954/2025).
-- Cualquiera puede pedirlo desde agendu.vercel.app/arrepentimiento, sin iniciar sesión.
-- Cada pedido queda guardado con un código de trámite; lo atendés vos desde Supabase.
-- Se puede correr más de una vez.

create table if not exists public.arrepentimientos (
  id          uuid primary key default gen_random_uuid(),
  codigo      text not null unique check (codigo ~ '^ARR-[A-Z0-9]{8}$'),
  email       text not null check (char_length(email) between 5 and 200 and email like '%@%'),
  motivo      text check (char_length(motivo) <= 1000),
  usuario_id  uuid references auth.users (id) on delete set null,
  estado      text not null default 'pendiente' check (estado in ('pendiente', 'atendido')),
  creado_en   timestamptz not null default now()
);

alter table public.arrepentimientos enable row level security;

-- Se puede crear un pedido sin iniciar sesión. Nadie puede leerlos desde la app (solo vos, desde Supabase).
-- Si hay sesión, solo con el propio usuario; si no, sin usuario.
drop policy if exists "Cualquiera pide arrepentimiento" on public.arrepentimientos;
create policy "Cualquiera pide arrepentimiento" on public.arrepentimientos
  for insert to anon, authenticated
  with check (estado = 'pendiente' and (usuario_id is null or usuario_id = (select auth.uid())));

grant insert (codigo, email, motivo, usuario_id) on public.arrepentimientos to anon, authenticated;