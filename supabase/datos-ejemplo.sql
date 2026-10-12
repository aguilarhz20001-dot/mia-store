-- OPCIONAL: los 10 productos de ejemplo de la tienda (sin stock ni fotos).
-- Córrelo después de schema.sql si quieres empezar con algo en la tienda.
-- Luego edítalos o bórralos desde el panel (/admin).
insert into public.products (slug, name, description, category, price, sizes, badge, featured) values
('sudadera-rosa','Sudadera rosa con capucha','Sudadera suave y cómoda, ideal para el clima de Chimaltenango.','ropa',145,'{S,M,L}','Nuevo',true),
('top-lila-mariposa','Top lila de mariposa','Top acanalado con detalle de mariposa bordada.','ropa',65,'{S,M,L}',null,true),
('bolso-rosa-cadena','Bolso rosa con cadena','Bolso pequeño con cadena dorada y cierre de corazón.','accesorios',120,'{}',null,true),
('lentes-de-sol','Lentes de sol clásicos','Lentes oscuros con protección UV.','accesorios',55,'{}',null,false),
('scrunchie-satin','Scrunchie de satín','Liga suave para el cabello que no maltrata.','accesorios',15,'{}',null,false),
('tenis-blancos-rosa','Tenis blancos con detalle rosa','Tenis cómodos que combinan con todo.','calzado',285,'{36,37,38,39,40}',null,true),
('set-brochas','Set de brochas de maquillaje','Brochas suaves para un maquillaje perfecto.','belleza',95,'{}',null,false),
('audifonos-rosa','Audífonos inalámbricos rosa','Bluetooth con buena batería y sonido nítido.','tecnologia',210,'{}','Popular',true),
('taza-gatito','Taza de gatito','Taza de cerámica para tus cafés y tés favoritos.','hogar',45,'{}',null,false),
('cuaderno-lila','Cuaderno lila de espiral','Cuaderno con portada de corazón y hojas rayadas.','varios',38,'{}',null,false)
on conflict (slug) do nothing;
