import { cache } from "react";
import { DEFAULT_CATEGORIES, getCategories, type Category, type CategoryId } from "./categories";
import { getPublicClient } from "./supabase/public";

export type Product = {
  slug: string;
  name: string;
  description: string;
  /** Precio en quetzales */
  price: number;
  category: CategoryId;
  /** Nombre e ícono de la categoría (se completan al cargar el catálogo) */
  categoryLabel?: string;
  categoryIcon?: string;
  /** Foto principal (la primera de `images`) */
  image?: string;
  /** Todas las fotos del producto */
  images?: string[];
  /** Video promocional (URL) */
  video?: string;
  badge?: string;
  sizes?: string[];
  /** false = agotado */
  inStock?: boolean;
  /** Unidades disponibles en bodega */
  stock?: number;
  featured?: boolean;
};

/** Fila de la tabla `products` en Supabase. */
export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  sizes: string[] | null;
  badge: string | null;
  featured: boolean;
  active: boolean;
  images: string[] | null;
  video_url: string | null;
  stock: number;
  created_at: string;
  updated_at: string;
};

/** Agrega el nombre y el ícono de la categoría a un producto. */
function withCategory(product: Product, categories: Category[]): Product {
  const cat = categories.find((c) => c.id === product.category);
  return { ...product, categoryLabel: cat?.label, categoryIcon: cat?.icon };
}

export function rowToProduct(row: ProductRow, categories: Category[] = DEFAULT_CATEGORIES): Product {
  const images = row.images ?? [];
  return withCategory({
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category as CategoryId,
    image: images[0],
    images,
    video: row.video_url ?? undefined,
    badge: row.badge ?? undefined,
    sizes: row.sizes && row.sizes.length > 0 ? row.sizes : undefined,
    stock: row.stock,
    inStock: row.stock > 0,
    featured: row.featured,
  }, categories);
}

// Productos de ejemplo: solo se usan mientras Supabase no esté configurado.
// El catálogo real se administra desde el panel (/admin).
const SAMPLE_PRODUCTS: Product[] = [
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

/** Todos los productos visibles de la tienda (una sola consulta por visita). */
export const getProducts = cache(async (): Promise<Product[]> => {
  const supabase = getPublicClient();
  if (!supabase) return SAMPLE_PRODUCTS.map((p) => withCategory(p, DEFAULT_CATEGORIES));
  const categories = await getCategories();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("No se pudieron cargar los productos:", error?.message);
    return [];
  }
  return (data as ProductRow[]).map((row) => rowToProduct(row, categories));
});

export async function getProduct(slug: string) {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export async function getProductsByCategory(category?: string) {
  const products = await getProducts();
  if (!category) return products;
  return products.filter((p) => p.category === category);
}

export async function getFeaturedProducts() {
  const products = await getProducts();
  return products.filter((p) => p.featured).slice(0, 8);
}
