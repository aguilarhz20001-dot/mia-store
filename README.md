# Mia Store

Tienda en línea para Chimaltenango, con entregas locales y envíos a todo el país.
Mismo stack y orden que Codenest: Next.js (App Router), Tailwind 4, framer-motion, lucide-react.

## Correr el proyecto

```bash
npm install
npm run dev
```

## Qué editar primero

| Archivo | Qué cambiar |
| --- | --- |
| `lib/contact.ts` | Número de WhatsApp, Facebook, Instagram |
| Panel `/admin` | Tu catálogo (nombre, precio, categoría, tallas, fotos, video) — ya no se edita en código |
| `lib/shipping.ts` | Costos y opciones de entrega |
| Panel `/admin/categorias` | Agrega, edita, ordena y borra categorías (antes se editaban en `lib/categories.ts`) |
| `public/envios/` | Ilustraciones de la página de Envíos (ya recortadas, con transparencia) |

## Estructura

- `app/` — páginas: inicio, `tienda`, `producto/[slug]`, `carrito`, `envios`, `contacto` y el panel `admin/`
- `components/` — Navbar, Footer, ProductCard, CartView, etc.
- `lib/` — datos y lógica (productos, carrito, envíos, contacto, `supabase/`, `admin/`)
- `supabase/` — SQL de la base de datos
- `public/` — logo, banner e imágenes

## Panel administrativo (Supabase)

El panel vive en `/admin` y sirve para: **editar productos** (fotos y video incluidos), ver tu **bodega** (stock),
registrar **compras** (qué compraste y cuánto costó) y **ventas** (en cuánto vendiste y cuánto ganaste),
con totales, ganancia, margen y % vendido.

### Puesta en marcha (una sola vez)

1. **Instala las dependencias nuevas:** `npm install` (agrega `@supabase/ssr` y `@supabase/supabase-js`). Sube también el `package-lock.json` actualizado a GitHub.
2. **Crea el proyecto en [supabase.com](https://supabase.com)** (plan gratis).
3. **Base de datos:** en Supabase → *SQL Editor* → *New query*, pega todo `supabase/schema.sql`.
   Antes de correrlo, cambia `tu-correo@ejemplo.com` por tu correo. Ese correo es el que podrá entrar al panel.
   (Opcional: corre también `supabase/datos-ejemplo.sql` para cargar los 10 productos de ejemplo.)
4. **Tu usuario:** *Authentication → Users → Add user → Create new user*, con ese mismo correo y una contraseña. Marca *Auto Confirm User*.
   Después, en *Authentication → Sign In / Providers*, **apaga "Allow new users to sign up"** para que nadie más se registre.
5. **Claves:** *Project Settings → API Keys*. Copia `.env.example` como `.env.local` y pega la URL del proyecto y la clave `anon` (o `publishable`).
6. `npm run dev` y entra a `http://localhost:3000/admin`.

### Cuadres (quincenal, mensual o cuando quieras)

En `/admin/cuadre` eliges un período (quincena, mes o fechas libres), ves vendido, ganancia, invertido, bodega y más vendidos, y lo guardas con **Cerrar cuadre**.
Los cuadres guardados son una foto que no cambia. Para activarlo corre `supabase/cuadres.sql` una sola vez en el SQL Editor.

### Al publicar (Vercel u otro)

Agrega las mismas dos variables, `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, en la configuración del proyecto y vuelve a desplegar.
Mientras no estén configuradas, la tienda muestra los productos de ejemplo.

### Cómo se calculan los números

- **Stock** = unidades compradas − unidades vendidas (se actualiza solo).
- **Costo promedio** = lo invertido en compras ÷ unidades compradas. Cada venta guarda el costo promedio de ese momento.
- **Ganancia** = ventas − costo de lo vendido. **Margen** = ganancia ÷ ventas.
- **% vendido** = unidades vendidas ÷ unidades compradas.
- **Venta potencial** = stock en bodega × precio de venta actual.
- Si algo ya tiene compras o ventas no se puede borrar (para no romper tus cuentas): ocúltalo con "Visible en la tienda".

## Cómo funciona el pedido

El carrito se guarda en el navegador (localStorage). Al enviar el pedido se abre WhatsApp con el
detalle, el total y los datos de entrega. Los pedidos no se descuentan solos de la bodega: cuando confirmes una
venta por WhatsApp, regístrala en el panel (Ventas). No hay pagos en línea todavía.
Cuando el cliente toca **Enviar pedido por WhatsApp**, el pedido se guarda en el sistema como **pendiente** (con su número, ej. «Pedido #12») y se abre WhatsApp con el mensaje.
En `/admin/pedidos` lo ves y, cuando se concreta la venta, tocas **Marcar vendido**: se registran las ventas, se descuenta el stock y entra a tus cuadres.
Si el cliente no compra, tocas **Cancelar** y el stock no se mueve. Si te equivocas, **Deshacer venta** devuelve las unidades a la bodega.

## Estilos (variantes) de un producto

En `/admin/productos` → editar un producto → sección **Estilos**: agrega cada diseño con su nombre, sus fotos y sus unidades.
En la tienda el cliente ve la foto de cada estilo, puede elegir varios estilos del mismo producto y cada uno lleva su propio stock.
Las compras y ventas de un producto con estilos piden elegir de cuál estilo son.

Para activar pedidos y estilos corre `supabase/variantes-y-pedidos.sql` una sola vez en el SQL Editor de Supabase.
