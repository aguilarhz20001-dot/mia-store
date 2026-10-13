-- ============================================================================
--  MIA STORE · Estilos por producto + Pedidos guardados
--  Pégalo en Supabase → SQL Editor → New query → Run (una sola vez).
--  Se puede correr de nuevo sin problema.
--  Requiere haber corrido antes schema.sql (y categorias.sql si ya lo usabas).
-- ============================================================================

-- 1) ESTILOS (variantes) -----------------------------------------------------
-- Ej.: la pijama "Pijama de seda" tiene los estilos "Gatitos", "Corazones", "Lunares".
-- Cada estilo tiene sus propias fotos y su propio stock.
create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  name        text not null,
  images      text[] not null default '{}',   -- la primera es la principal del estilo
  sort_order  integer not null default 0,
  active      boolean not null default true,  -- visible en la tienda
  stock       integer not null default 0,     -- se calcula solo (compras - ventas de este estilo)
  created_at  timestamptz not null default now(),
  unique (product_id, name)
);
create index if not exists product_variants_product_idx on public.product_variants(product_id);

-- 2) PEDIDOS (lo que el cliente manda por WhatsApp queda guardado aquí) --------
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  number         integer generated always as identity unique,   -- "Pedido #12"
  status         text not null default 'pendiente' check (status in ('pendiente', 'vendido', 'cancelado')),
  customer_name  text not null,
  customer_phone text not null,
  delivery       text not null,                  -- chimaltenango | nacional
  delivery_fee   numeric(10,2) not null default 0,
  address        text not null,
  notes          text,
  subtotal       numeric(10,2) not null default 0,
  total          numeric(10,2) not null default 0,
  created_at     timestamptz not null default now(),
  completed_at   timestamptz
);
create index if not exists orders_status_idx on public.orders(status, created_at desc);

create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid not null references public.products(id) on delete restrict,
  variant_id   uuid references public.product_variants(id) on delete restrict,
  product_name text not null,
  variant_name text,
  size         text,
  qty          integer not null check (qty > 0),
  unit_price   numeric(10,2) not null check (unit_price >= 0),   -- precio al momento de pedir
  created_at   timestamptz not null default now()
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- 3) COMPRAS Y VENTAS AHORA SABEN DE QUÉ ESTILO SON ----------------------------
alter table public.purchases add column if not exists variant_id uuid references public.product_variants(id) on delete restrict;
alter table public.sales     add column if not exists variant_id uuid references public.product_variants(id) on delete restrict;
alter table public.sales     add column if not exists order_id   uuid references public.orders(id) on delete set null;

create index if not exists purchases_variant_idx on public.purchases(variant_id);
create index if not exists sales_variant_idx on public.sales(variant_id);
create index if not exists sales_order_idx on public.sales(order_id);

-- 4) STOCK: el del producto sigue siendo compras - ventas (todas); el de cada estilo, las suyas
create or replace function public.recalc_variant_stock(vid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.product_variants
  set stock = coalesce((select sum(qty) from public.purchases where variant_id = vid), 0)
            - coalesce((select sum(qty) from public.sales where variant_id = vid), 0)
  where id = vid;
end $$;
revoke execute on function public.recalc_variant_stock(uuid) from public, anon, authenticated;

create or replace function public.trg_recalc_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    perform public.recalc_stock(old.product_id);
    if old.variant_id is not null then perform public.recalc_variant_stock(old.variant_id); end if;
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    perform public.recalc_stock(new.product_id);
    if new.variant_id is not null then perform public.recalc_variant_stock(new.variant_id); end if;
  end if;
  return null;
end $$;
-- (los triggers purchases_stock y sales_stock de schema.sql ya llaman a esta función)

-- Compras: si el producto tiene estilos, hay que decir de cuál es
create or replace function public.trg_purchase_before_insert()
returns trigger
language plpgsql
as $$
begin
  if new.variant_id is not null then
    if not exists (select 1 from public.product_variants where id = new.variant_id and product_id = new.product_id) then
      raise exception 'Ese estilo no pertenece a este producto.';
    end if;
  elsif exists (select 1 from public.product_variants where product_id = new.product_id) then
    raise exception 'Este producto tiene estilos: elige de cuál estilo es la compra.';
  end if;
  return new;
end $$;

drop trigger if exists purchases_before_insert on public.purchases;
create trigger purchases_before_insert before insert on public.purchases
  for each row execute function public.trg_purchase_before_insert();

-- Ventas: valida el stock del estilo (o del producto si no tiene estilos) y guarda el costo promedio
create or replace function public.trg_sale_before_insert()
returns trigger
language plpgsql
as $$
declare
  cur_stock integer;
  avg_cost  numeric;
begin
  if new.variant_id is not null then
    if not exists (select 1 from public.product_variants where id = new.variant_id and product_id = new.product_id) then
      raise exception 'Ese estilo no pertenece a este producto.';
    end if;
    select stock into cur_stock from public.product_variants where id = new.variant_id;
  else
    if exists (select 1 from public.product_variants where product_id = new.product_id) then
      raise exception 'Este producto tiene estilos: elige cuál estilo se vendió.';
    end if;
    select stock into cur_stock from public.products where id = new.product_id;
  end if;

  if new.qty > coalesce(cur_stock, 0) then
    raise exception 'Stock insuficiente: solo hay % unidades disponibles.', coalesce(cur_stock, 0);
  end if;

  if new.unit_cost is null then
    if new.variant_id is not null then
      select coalesce(sum(qty * unit_cost) / nullif(sum(qty), 0), 0)
        into avg_cost
        from public.purchases
       where variant_id = new.variant_id;
    else
      select coalesce(sum(qty * unit_cost) / nullif(sum(qty), 0), 0)
        into avg_cost
        from public.purchases
       where product_id = new.product_id;
    end if;
    new.unit_cost := round(avg_cost, 2);
  end if;
  return new;
end $$;
-- (el trigger sales_before_insert de schema.sql ya llama a esta función)

-- 5) CREAR UN PEDIDO (lo llama la tienda cuando el cliente toca "Enviar por WhatsApp") ------
-- Toma los precios de la base de datos (no del navegador del cliente) y valida todo.
create or replace function public.create_order(
  p_name     text,
  p_phone    text,
  p_delivery text,
  p_fee      numeric,
  p_address  text,
  p_notes    text,
  p_items    jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order   public.orders;
  it        jsonb;
  prod      public.products;
  vr        public.product_variants;
  v_qty     integer;
  v_variant uuid;
  v_subtotal numeric := 0;
begin
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = '' or coalesce(trim(p_address), '') = '' then
    raise exception 'Faltan datos del pedido.';
  end if;
  if length(p_name) > 120 or length(p_phone) > 40 or length(p_address) > 500 or length(coalesce(p_notes, '')) > 500 then
    raise exception 'Algún dato del pedido es demasiado largo.';
  end if;
  if p_delivery not in ('chimaltenango', 'nacional') then
    raise exception 'Forma de entrega no válida.';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 40 then
    raise exception 'El pedido no tiene productos.';
  end if;

  insert into public.orders (customer_name, customer_phone, delivery, delivery_fee, address, notes)
  values (trim(p_name), trim(p_phone), p_delivery, greatest(0, least(coalesce(p_fee, 0), 500)), trim(p_address), nullif(trim(coalesce(p_notes, '')), ''))
  returning * into v_order;

  for it in select value from jsonb_array_elements(p_items) loop
    v_qty := (it ->> 'qty')::integer;
    v_variant := nullif(it ->> 'variant_id', '')::uuid;
    if v_qty is null or v_qty < 1 or v_qty > 99 then
      raise exception 'Cantidad no válida.';
    end if;

    select * into prod from public.products where slug = (it ->> 'slug') and active = true;
    if not found then
      raise exception 'Un producto de tu carrito ya no está disponible.';
    end if;

    vr := null;
    if v_variant is not null then
      select * into vr from public.product_variants where id = v_variant and product_id = prod.id and active = true;
      if not found then
        raise exception 'Un estilo de tu carrito ya no está disponible.';
      end if;
    elsif exists (select 1 from public.product_variants where product_id = prod.id and active = true) then
      raise exception 'Elige el estilo de %.', prod.name;
    end if;

    insert into public.order_items (order_id, product_id, variant_id, product_name, variant_name, size, qty, unit_price)
    values (v_order.id, prod.id, vr.id, prod.name, vr.name, nullif(it ->> 'size', ''), v_qty, prod.price);

    v_subtotal := v_subtotal + v_qty * prod.price;
  end loop;

  update public.orders
     set subtotal = v_subtotal, total = v_subtotal + v_order.delivery_fee
   where id = v_order.id;

  return jsonb_build_object('id', v_order.id, 'number', v_order.number);
end $$;

revoke execute on function public.create_order(text, text, text, numeric, text, text, jsonb) from public;
grant execute on function public.create_order(text, text, text, numeric, text, text, jsonb) to anon, authenticated;

-- 6) MARCAR UN PEDIDO COMO VENDIDO (crea las ventas y baja el stock, todo o nada) ----------
create or replace function public.fulfill_order(p_order_id uuid, p_sold_at date default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  o  public.orders;
  it public.order_items;
begin
  if not public.is_admin() then
    raise exception 'No tienes permiso para hacer esto.';
  end if;

  select * into o from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'No se encontró el pedido.';
  end if;
  if o.status <> 'pendiente' then
    raise exception 'Este pedido ya no está pendiente.';
  end if;

  for it in select * from public.order_items where order_id = o.id order by created_at loop
    insert into public.sales (product_id, variant_id, qty, unit_price, unit_cost, customer, channel, sold_at, notes, order_id)
    values (
      it.product_id, it.variant_id, it.qty, it.unit_price, null, o.customer_name, 'WhatsApp',
      coalesce(p_sold_at, (now() at time zone 'America/Guatemala')::date),
      'Pedido #' || o.number || coalesce(' · talla ' || it.size, ''),
      o.id
    );
  end loop;

  update public.orders set status = 'vendido', completed_at = now() where id = o.id;
end $$;

-- 7) DESHACER UNA VENTA DE PEDIDO (por si te equivocaste): las unidades vuelven a la bodega -------
create or replace function public.reopen_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders;
begin
  if not public.is_admin() then
    raise exception 'No tienes permiso para hacer esto.';
  end if;

  select * into o from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'No se encontró el pedido.';
  end if;
  if o.status <> 'vendido' then
    raise exception 'Solo se pueden deshacer pedidos vendidos.';
  end if;

  delete from public.sales where order_id = o.id;
  update public.orders set status = 'pendiente', completed_at = null where id = o.id;
end $$;

revoke execute on function public.fulfill_order(uuid, date) from public, anon;
revoke execute on function public.reopen_order(uuid) from public, anon;
grant execute on function public.fulfill_order(uuid, date) to authenticated;
grant execute on function public.reopen_order(uuid) to authenticated;

-- 8) SEGURIDAD (RLS) -------------------------------------------------------------
alter table public.product_variants enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;

drop policy if exists "Tienda: ver estilos" on public.product_variants;
create policy "Tienda: ver estilos" on public.product_variants
  for select to anon, authenticated
  using (
    public.is_admin()
    or (active = true and exists (select 1 from public.products p where p.id = product_id and p.active = true))
  );

drop policy if exists "Admin: crear estilos" on public.product_variants;
create policy "Admin: crear estilos" on public.product_variants
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admin: editar estilos" on public.product_variants;
create policy "Admin: editar estilos" on public.product_variants
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin: borrar estilos" on public.product_variants;
create policy "Admin: borrar estilos" on public.product_variants
  for delete to authenticated using (public.is_admin());

-- Los pedidos solo los ve y maneja el administrador (los clientes los crean con create_order)
drop policy if exists "Admin: pedidos" on public.orders;
create policy "Admin: pedidos" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin: productos de pedidos" on public.order_items;
create policy "Admin: productos de pedidos" on public.order_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
