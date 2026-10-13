-- ============================================================================
--  MIA STORE · Gastos (bolsas, gasolina, stickers, etc.)
--  Pégalo en Supabase → SQL Editor → New query → Run (una sola vez).
--  Se puede correr de nuevo sin problema.
-- ============================================================================

create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  description text not null,                         -- ej. "Bolsas de regalo"
  category    text,                                  -- ej. "Empaque", "Transporte"
  amount      numeric(12,2) not null check (amount >= 0),
  spent_at    date not null default current_date,
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists expenses_spent_at_idx on public.expenses(spent_at);

alter table public.expenses enable row level security;

drop policy if exists "Admin: gastos" on public.expenses;
create policy "Admin: gastos" on public.expenses
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
