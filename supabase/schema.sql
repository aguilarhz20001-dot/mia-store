-- =====================================================================
-- Mia Store · Base de datos (Supabase)
-- Pégalo completo en Supabase → SQL Editor → New query → Run.
-- Se puede correr varias veces sin romper nada.
-- =====================================================================

-- 1) ADMINISTRADORES ---------------------------------------------------
-- Solo los correos que estén en esta tabla pueden entrar al panel.
create table if not exists public.admin_emails (
  email text primary key
);
alter table public.admin_emails enable row level security;
-- (sin políticas: nadie la lee directo, solo la función is_admin)

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ⚠️ CAMBIA ESTE CORREO por el tuyo (el mismo con el que crearás tu usuario):
insert into public.admin_emails (email) values ('tu-correo@ejemplo.com')
on conflict do nothing;

-- 2) TABLAS ------------------------------------------------------------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text not null default '',
  category    text not null default 'varios',
  price       numeric(10,2) not null default 0 check (price >= 0),  -- precio de venta
  sizes       text[] not null default '{}',
  badge       text,
  featured    boolean not null default false,
  active      boolean not null default true,                        -- visible en la tienda
  images      text[] not null default '{}',                         -- la primera es la principal
  video_url   text,
  stock       integer not null default 0,                           -- se calcula solo (compras - ventas)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.purchases (          -- COMPRAS (entradas a bodega)
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete restrict,
  qty          integer not null check (qty > 0),
  unit_cost    numeric(10,2) not null check (unit_cost >= 0),       -- lo que costó cada unidad
  supplier     text,
  purchased_at date not null default current_date,
  notes        text,
  created_at   timestamptz not null default now()
);

create table if not exists public.sales (              -- VENTAS (salidas de bodega)
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete restrict,
  qty         integer not null check (qty > 0),
  unit_price  numeric(10,2) not null check (unit_price >= 0),       -- en cuánto se vendió cada unidad
  unit_cost   numeric(10,2) not null,                               -- costo promedio al momento de vender (automático)
  customer    text,
  channel     text,
  sold_at     date not null default current_date,
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists purchases_product_idx on public.purchases(product_id);
create index if not exists sales_product_idx on public.sales(product_id);

-- 3) AUTOMATIZACIONES --------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- Recalcula el stock de un producto: total comprado - total vendido
create or replace function public.recalc_stock(pid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
  set stock = coalesce((select sum(qty) from public.purchases where product_id = pid), 0)
            - coalesce((select sum(qty) from public.sales where product_id = pid), 0)
  where id = pid;
end $$;
revoke execute on function public.recalc_stock(uuid) from public, anon, authenticated;

create or replace function public.trg_recalc_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then perform public.recalc_stock(old.product_id); end if;
  if tg_op in ('INSERT', 'UPDATE') then perform public.recalc_stock(new.product_id); end if;
  return null;
end $$;

drop trigger if exists purchases_stock on public.purchases;
create trigger purchases_stock after insert or update or delete on public.purchases
  for each row execute function public.trg_recalc_stock();

drop trigger if exists sales_stock on public.sales;
create trigger sales_stock after insert or update or delete on public.sales
  for each row execute function public.trg_recalc_stock();

-- Antes de guardar una venta: no vender más de lo que hay y guardar el costo promedio
create or replace function public.trg_sale_before_insert()
returns trigger
language plpgsql
as $$
declare
  cur_stock integer;
  avg_cost  numeric;
begin
  select stock into cur_stock from public.products where id = new.product_id;
  if new.qty > coalesce(cur_stock, 0) then
    raise exception 'Stock insuficiente: solo hay % unidades disponibles.', coalesce(cur_stock, 0);
  end if;

  if new.unit_cost is null then
    select coalesce(sum(qty * unit_cost) / nullif(sum(qty), 0), 0)
      into avg_cost
      from public.purchases
     where product_id = new.product_id;
    new.unit_cost := round(avg_cost, 2);
  end if;
  return new;
end $$;

drop trigger if exists sales_before_insert on public.sales;
create trigger sales_before_insert before insert on public.sales
  for each row execute function public.trg_sale_before_insert();

-- 4) SEGURIDAD (RLS) ---------------------------------------------------
alter table public.products  enable row level security;
alter table public.purchases enable row level security;
alter table public.sales     enable row level security;

drop policy if exists "Tienda: ver productos visibles" on public.products;
create policy "Tienda: ver productos visibles" on public.products
  for select to anon, authenticated
  using (active = true or public.is_admin());

drop policy if exists "Admin: crear productos" on public.products;
create policy "Admin: crear productos" on public.products
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admin: editar productos" on public.products;
create policy "Admin: editar productos" on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin: borrar productos" on public.products;
create policy "Admin: borrar productos" on public.products
  for delete to authenticated using (public.is_admin());

drop policy if exists "Admin: compras" on public.purchases;
create policy "Admin: compras" on public.purchases
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin: ventas" on public.sales;
create policy "Admin: ventas" on public.sales
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 5) FOTOS Y VIDEOS (Storage) -------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'productos', 'productos', true, 52428800,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
)
on conflict (id) do nothing;

drop policy if exists "Productos: ver archivos" on storage.objects;
create policy "Productos: ver archivos" on storage.objects
  for select using (bucket_id = 'productos');

drop policy if exists "Productos: subir archivos" on storage.objects;
create policy "Productos: subir archivos" on storage.objects
  for insert to authenticated with check (bucket_id = 'productos' and public.is_admin());

drop policy if exists "Productos: cambiar archivos" on storage.objects;
create policy "Productos: cambiar archivos" on storage.objects
  for update to authenticated using (bucket_id = 'productos' and public.is_admin());

drop policy if exists "Productos: borrar archivos" on storage.objects;
create policy "Productos: borrar archivos" on storage.objects
  for delete to authenticated using (bucket_id = 'productos' and public.is_admin());
