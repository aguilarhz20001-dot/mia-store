-- ============================================================================
--  MIA STORE · Cuadres guardados (quincenal, mensual o cuando tú quieras)
--  Pégalo en Supabase → SQL Editor → New query → Run (una sola vez).
--  Se puede correr de nuevo sin problema.
-- ============================================================================

create table if not exists public.closings (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,                 -- ej. "1ª quincena de octubre 2026"
  period_start date not null,
  period_end   date not null check (period_end >= period_start),
  notes        text,
  snapshot     jsonb not null,                -- foto de los números al momento de cerrar (no cambia después)
  created_at   timestamptz not null default now()
);

create index if not exists closings_period_idx on public.closings(period_start, period_end);

alter table public.closings enable row level security;

drop policy if exists "Admin: cuadres" on public.closings;
create policy "Admin: cuadres" on public.closings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
