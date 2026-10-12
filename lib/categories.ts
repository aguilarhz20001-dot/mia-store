import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicClient } from "./supabase/public";

export type CategoryId = string;

export type Category = {
  id: CategoryId;
  label: string;
  description: string;
  /** Nombre del ícono (ver components/iconMap.ts) */
  icon: string;
};

/**
 * Categorías de partida. Se usan mientras Supabase no esté configurado
 * o si todavía no se ha creado la tabla `categories` (supabase/categorias.sql).
 * Una vez creada, las categorías se administran desde el panel (/admin/categorias).
 */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: "ropa", label: "Ropa", description: "Sudaderas, blusas, camisas y más", icon: "shirt" },
  { id: "accesorios", label: "Accesorios", description: "Bolsos, lentes, joyería y scrunchies", icon: "shopping-bag" },
  { id: "calzado", label: "Calzado", description: "Tenis y zapatos para todos los días", icon: "footprints" },
  { id: "belleza", label: "Belleza", description: "Maquillaje y cuidado personal", icon: "sparkles" },
  { id: "hogar", label: "Hogar", description: "Detalles lindos para tu espacio", icon: "house" },
  { id: "tecnologia", label: "Tecnología", description: "Audífonos, fundas y gadgets", icon: "headphones" },
  { id: "varios", label: "Artículos varios", description: "Muchas cositas más para ti", icon: "gift" },
];

/** Lee las categorías con el cliente de Supabase que se le pase (público o del panel). */
export async function fetchCategories(supabase: SupabaseClient | null): Promise<Category[]> {
  if (!supabase) return DEFAULT_CATEGORIES;
  const { data, error } = await supabase
    .from("categories")
    .select("id, label, description, icon")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });
  if (error || !data) return DEFAULT_CATEGORIES; // por ejemplo: la tabla aún no existe
  return data as Category[];
}

/** Categorías de la tienda (una sola consulta por visita). */
export const getCategories = cache(async (): Promise<Category[]> => fetchCategories(getPublicClient()));

export function findCategory(categories: Category[], id: string | null | undefined) {
  return categories.find((c) => c.id === id);
}
