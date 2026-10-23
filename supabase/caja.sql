-- ============================================================================
--  MIA STORE · Caja (el dinero que tienen para surtir y gastar)
--  Pégalo en Supabase → SQL Editor → New query → Run (una sola vez).
--  Se puede correr de nuevo sin problema.
--  Tip: corre antes gastos.sql si todavía no lo hiciste.
-- ============================================================================

-- ¿Con qué dinero se pagó cada compra? 'caja' resta de la caja; 'personal' no la toca.
-- Las compras que ya existían quedan como 'personal' para no descuadrar la caja.
alter table public.purchases
  add column if not exists paid_from text not null default 'personal'
  check (paid_from in ('caja', 'personal'));

-- Lo mismo para los gastos (bolsas, gasolina…), si la tabla ya existe
do $$
begin
  if to_regclass('public.expenses') is not null then
    alter table public.expenses
      add column if not exists paid_from text not null default 'personal'
      check (paid_from in ('caja', 'personal'));
  end if;
end $$;

-- Movimientos manuales de la caja: dinero que se mete o se saca (incluye los ajustes al contar)
create table if not exists public.cash_movements (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null check (kind in ('deposito', 'retiro')),
  amount     numeric(12,2) not null check (amount > 0),
  concept    text not null,
  moved_at   date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists cash_movements_moved_at_idx on public.cash_movements(moved_at);

alter table public.cash_movements enable row level security;

drop policy if exists "Admin: caja" on public.cash_movements;
create policy "Admin: caja" on public.cash_movements
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
