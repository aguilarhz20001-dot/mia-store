import type { CategoryId } from "./categories";

export type Product = {
  slug: string;
  name: string;
  description: string;
  /** Precio en quetzales */
  price: number;
  category: CategoryId;
  /** Ruta en /public, ej. "/productos/sudadera-rosa.jpg". Si falta se muestra un placeholder */
  image?: string;
  badge?: string;
  sizes?: string[];
  inStock?: boolean;
  featured?: boolean;
};

// TODO: reemplaza estos productos de ejemplo por tu catálogo real.
// Para agregar fotos: súbelas a /public/productos y pon la ruta en `image`.
export const PRODUCTS: Product[] = [
  {
    slug: "sudadera-rosa",
    name: "Sudadera rosa con capucha",
    description: "Sudadera suave y cómoda, ideal para el clima de Chimaltenango.",
    price: 145,
    category: "ropa",
    sizes: ["S", "M", "L"],
    badge: "Nuevo",
    featured: true,
  },
  {
    slug: "top-lila-mariposa",
    name: "Top lila de mariposa",
    description: "Top acanalado con detalle de mariposa bordada.",
    price: 65,
    category: "ropa",
    sizes: ["S", "M", "L"],
    featured: true,
  },
  {
    slug: "bolso-rosa-cadena",
    name: "Bolso rosa con cadena",
    description: "Bolso pequeño con cadena dorada y cierre de corazón.",
    price: 120,
    category: "accesorios",
    featured: true,
  },
  {
    slug: "lentes-de-sol",
    name: "Lentes de sol clásicos",
    description: "Lentes oscuros con protección UV.",
    price: 55,
    category: "accesorios",
  },
  {
    slug: "scrunchie-satin",
    name: "Scrunchie de satín",
    description: "Liga suave para el cabello que no maltrata.",
    price: 15,
    category: "accesorios",
  },
  {
    slug: "tenis-blancos-rosa",
    name: "Tenis blancos con detalle rosa",
    description: "Tenis cómodos que combinan con todo.",
    price: 285,
    category: "calzado",
    sizes: ["36", "37", "38", "39", "40"],
    featured: true,
  },
  {
    slug: "set-brochas",
    name: "Set de brochas de maquillaje",
    description: "Brochas suaves para un maquillaje perfecto.",
    price: 95,
    category: "belleza",
  },
  {
    slug: "audifonos-rosa",
    name: "Audífonos inalámbricos rosa",
    description: "Bluetooth con buena batería y sonido nítido.",
    price: 210,
    category: "tecnologia",
    badge: "Popular",
    featured: true,
  },
  {
    slug: "taza-gatito",
    name: "Taza de gatito",
    description: "Taza de cerámica para tus cafés y tés favoritos.",
    price: 45,
    category: "hogar",
  },
  {
    slug: "cuaderno-lila",
    name: "Cuaderno lila de espiral",
    description: "Cuaderno con portada de corazón y hojas rayadas.",
    price: 38,
    category: "varios",
  },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category?: string) {
  if (!category) return PRODUCTS;
  return PRODUCTS.filter((p) => p.category === category);
}

export function getFeaturedProducts() {
  return PRODUCTS.filter((p) => p.featured);
}
