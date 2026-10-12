-- ============================================================================
--  MIA STORE · Categorías administrables desde el panel
--  Pégalo en Supabase → SQL Editor → New query → Run (una sola vez).
--  Se puede correr de nuevo sin problema.
-- ============================================================================

-- 1) Tabla de categorías
create table if not exists public.categories (
  id          text primary key,                 -- el "enlace" de la categoría (ej. ropa); no cambia al renombrarla
  label       text not null,                    -- nombre que ve el cliente
  description text not null default '',
  icon        text not null default 'package',  -- nombre del ícono (se elige en el panel)
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- 2) Las 7 categorías que ya tenías como punto de partida
insert into public.categories (id, label, description, icon, sort_order) values
  ('ropa',       'Ropa',             'Sudaderas, blusas, camisas y más',      'shirt',       0),
  ('accesorios', 'Accesorios',       'Bolsos, lentes, joyería y scrunchies',  'shopping-bag',1),
  ('calzado',    'Calzado',          'Tenis y zapatos para todos los días',   'footprints',  2),
  ('belleza',    'Belleza',          'Maquillaje y cuidado personal',         'sparkles',    3),
  ('hogar',      'Hogar',            'Detalles lindos para tu espacio',       'house',       4),
  ('tecnologia', 'Tecnología',       'Audífonos, fundas y gadgets',           'headphones',  5),
  ('varios',     'Artículos varios', 'Muchas cositas más para ti',            'gift',        6)
on conflict (id) do nothing;

-- 3) Si algún producto usa una categoría que no está en la lista, se crea para que no se pierda
insert into public.categories (id, label, description, icon, sort_order)
select distinct p.category, initcap(replace(p.category, '-', ' ')), '', 'package', 99
from public.products p
where p.category not in (select id from public.categories)
on conflict (id) do nothing;

-- 4) Cada producto debe tener una categoría que exista.
--    No deja borrar una categoría que todavía tiene productos.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_category_fkey') then
    alter table public.products
      add constraint products_category_fkey
      foreign key (category) references public.categories(id)
      on update cascade on delete restrict;
  end if;
end $$;

-- 5) Seguridad: todos pueden ver las categorías; solo el administrador las cambia
alter table public.categories enable row level security;

drop policy if exists "Tienda: ver categorías" on public.categories;
create policy "Tienda: ver categorías" on public.categories
  for select to anon, authenticated using (true);

drop policy if exists "Admin: crear categorías" on public.categories;
create policy "Admin: crear categorías" on public.categories
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admin: editar categorías" on public.categories;
create policy "Admin: editar categorías" on public.categories
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin: borrar categorías" on public.categories;
create policy "Admin: borrar categorías" on public.categories
  for delete to authenticated using (public.is_admin());
