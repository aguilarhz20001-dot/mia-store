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
| `lib/products.ts` | Tu catálogo (nombre, precio, categoría, tallas, foto) |
| `lib/shipping.ts` | Costos y opciones de entrega |
| `lib/categories.ts` | Categorías de la tienda |
| `public/productos/` | Fotos de productos (ruta en `image` del producto) |
| `public/envios/` | Ilustraciones de la página de Envíos (ya recortadas, con transparencia) |

## Estructura

- `app/` — páginas: inicio, `tienda`, `producto/[slug]`, `carrito`, `envios`, `contacto`
- `components/` — Navbar, Footer, ProductCard, CartView, etc.
- `lib/` — datos y lógica (productos, carrito, envíos, contacto)
- `public/` — logo, banner e imágenes

## Cómo funciona el pedido

El carrito se guarda en el navegador (localStorage). Al enviar el pedido se abre WhatsApp con el
detalle, el total y los datos de entrega. No hay base de datos ni pagos en línea todavía.
