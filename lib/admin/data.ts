import { createClient } from "@/lib/supabase/server";
import type { ProductRow } from "@/lib/products";
import type { PurchaseRow, SaleRow } from "./types";
import { buildStats } from "./stats";
import { fetchCategories } from "@/lib/categories";

type Page = PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>;

/** Trae todas las filas de una tabla, de 1000 en 1000 (Supabase devuelve máximo 1000 por consulta). */
async function fetchAll<T>(page: (from: number, to: number) => Page): Promise<{ data: T[]; error: string | null }> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await page(from, from + 999);
    if (error) return { data: out, error: error.message };
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return { data: out, error: null };
}

/** Productos, compras y ventas completos (sin el límite de 1000 filas). */
export async function loadRawData(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [products, purchases, sales] = await Promise.all([
    fetchAll<ProductRow>((a, b) => supabase.from("products").select("*").order("name").range(a, b)),
    fetchAll<PurchaseRow>((a, b) =>
      supabase.from("purchases").select("*").order("purchased_at", { ascending: false }).order("created_at", { ascending: false }).range(a, b),
    ),
    fetchAll<SaleRow>((a, b) =>
      supabase.from("sales").select("*").order("sold_at", { ascending: false }).order("created_at", { ascending: false }).range(a, b),
    ),
  ]);
  return {
    error: products.error ?? purchases.error ?? sales.error,
    products: products.data,
    purchases: purchases.data,
    sales: sales.data,
  };
}

/** Carga productos, compras y ventas y calcula todos los números del panel. */
export async function loadAdminData() {
  const supabase = await createClient();
  const categories = await fetchCategories(supabase);
  const raw = await loadRawData(supabase);
  const { error, products: productRows, purchases: purchaseRows, sales: saleRows } = raw;

  return {
    error,
    categories,
    products: productRows,
    purchases: purchaseRows,
    sales: saleRows,
    ...buildStats(productRows, purchaseRows, saleRows),
  };
}
