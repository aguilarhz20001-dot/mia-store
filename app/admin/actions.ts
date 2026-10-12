"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/admin/types";
import { slugify } from "@/lib/format";
import { loadRawData } from "@/lib/admin/data";
import { computeClosing } from "@/lib/admin/closing";
import { isValidDate } from "@/lib/admin/periods";

export type ProductInput = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  sizes: string[];
  badge: string | null;
  featured: boolean;
  active: boolean;
  images: string[];
  video_url: string | null;
};

export type PurchaseInput = {
  product_id: string;
  qty: number;
  unit_cost: number;
  supplier: string | null;
  purchased_at: string;
  notes: string | null;
};

export type ReceiveStockInput = {
  name: string;
  category: string;
  qty: number;
  unit_cost: number;
  supplier: string | null;
  purchased_at: string;
  notes: string | null;
};

export type CategoryInput = {
  id?: string;
  label: string;
  description: string;
  icon: string;
};

export type ClosingInput = {
  name: string;
  start: string;
  end: string;
  notes: string | null;
};

export type SaleInput = {
  product_id: string;
  qty: number;
  unit_price: number;
  customer: string | null;
  channel: string | null;
  sold_at: string;
  notes: string | null;
};

async function getAdminClient() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ? supabase : null;
}

/** Refresca la tienda y el panel después de un cambio. */
function refresh() {
  revalidatePath("/", "layout");
}

function friendly(message: string, code?: string) {
  if (code === "23505") return "Ya existe un producto con ese enlace (slug). Cambia el nombre o el enlace.";
  if (code === "23503") return "Este producto ya tiene compras o ventas. Mejor ocúltalo de la tienda en vez de borrarlo.";
  return message;
}

const NO_SESSION: ActionResult = { ok: false, error: "Tu sesión terminó. Vuelve a entrar al panel." };

export async function saveProduct(input: ProductInput): Promise<ActionResult> {
  const supabase = await getAdminClient();
  if (!supabase) return NO_SESSION;

  const name = input.name.trim();
  const slug = input.slug.trim();
  if (!name) return { ok: false, error: "Escribe el nombre del producto." };
  if (!slug) return { ok: false, error: "El enlace del producto no puede estar vacío." };
  if (!Number.isFinite(input.price) || input.price < 0) return { ok: false, error: "El precio no es válido." };

  const fields = {
    slug,
    name,
    description: input.description.trim(),
    category: input.category,
    price: input.price,
    sizes: input.sizes,
    badge: input.badge?.trim() || null,
    featured: input.featured,
    active: input.active,
    images: input.images,
    video_url: input.video_url?.trim() || null,
  };

  if (input.id) {
    const { error } = await supabase.from("products").update(fields).eq("id", input.id);
    if (error) return { ok: false, error: friendly(error.message, error.code) };
    refresh();
    return { ok: true, id: input.id };
  }

  const { data, error } = await supabase.from("products").insert(fields).select("id").single();
  if (error) return { ok: false, error: friendly(error.message, error.code) };
  refresh();
  return { ok: true, id: data.id as string };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const supabase = await getAdminClient();
  if (!supabase) return NO_SESSION;
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: friendly(error.message, error.code) };
  refresh();
  return { ok: true };
}

export async function createPurchase(input: PurchaseInput): Promise<ActionResult> {
  const supabase = await getAdminClient();
  if (!supabase) return NO_SESSION;
  if (!input.product_id) return { ok: false, error: "Elige el producto." };
  if (!Number.isInteger(input.qty) || input.qty <= 0) return { ok: false, error: "La cantidad debe ser un número entero mayor a 0." };
  if (!Number.isFinite(input.unit_cost) || input.unit_cost < 0) return { ok: false, error: "El costo por unidad no es válido." };

  const { error } = await supabase.from("purchases").insert({
    product_id: input.product_id,
    qty: input.qty,
    unit_cost: input.unit_cost,
    supplier: input.supplier?.trim() || null,
    purchased_at: input.purchased_at,
    notes: input.notes?.trim() || null,
  });
  if (error) return { ok: false, error: friendly(error.message, error.code) };
  refresh();
  return { ok: true };
}

/**
 * Ingresa mercadería nueva a la bodega: crea el producto (oculto en la tienda y con precio 0)
 * y registra su primera compra con el costo. Luego se completa en Productos (precio, fotos, etc.).
 */
export async function receiveNewStock(input: ReceiveStockInput): Promise<ActionResult> {
  const supabase = await getAdminClient();
  if (!supabase) return NO_SESSION;

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Escribe el nombre del producto." };
  if (!input.category) return { ok: false, error: "Elige la categoría del producto." };
  if (!Number.isInteger(input.qty) || input.qty <= 0) return { ok: false, error: "La cantidad debe ser un número entero mayor a 0." };
  if (!Number.isFinite(input.unit_cost) || input.unit_cost < 0) return { ok: false, error: "El costo por unidad no es válido." };

  const base = slugify(name) || "producto";
  let productId = "";
  for (let attempt = 0; attempt < 4; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await supabase
      .from("products")
      .insert({ slug, name, category: input.category, price: 0, active: false })
      .select("id")
      .single();
    if (!error) {
      productId = data.id as string;
      break;
    }
    if (error.code === "23503") return { ok: false, error: "Esa categoría ya no existe. Elige otra." };
    if (error.code !== "23505") return { ok: false, error: friendly(error.message, error.code) };
  }
  if (!productId) return { ok: false, error: "No se pudo crear el producto. Intenta con otro nombre." };

  const { error: purchaseError } = await supabase.from("purchases").insert({
    product_id: productId,
    qty: input.qty,
    unit_cost: input.unit_cost,
    supplier: input.supplier?.trim() || null,
    purchased_at: input.purchased_at,
    notes: input.notes?.trim() || null,
  });
  if (purchaseError) {
    await supabase.from("products").delete().eq("id", productId); // no dejar un producto vacío a medias
    return { ok: false, error: friendly(purchaseError.message, purchaseError.code) };
  }

  refresh();
  return { ok: true, id: productId };
}

function categoryError(message: string, code?: string) {
  if (code === "PGRST205" || code === "42P01")
    return "Todavía no existe la tabla de categorías. Corre el archivo supabase/categorias.sql en el SQL Editor de Supabase.";
  if (code === "23505") return "Ya existe una categoría con ese nombre.";
  return message;
}

/** Crea una categoría nueva o edita nombre, descripción e ícono de una existente. */
export async function saveCategory(input: CategoryInput): Promise<ActionResult> {
  const supabase = await getAdminClient();
  if (!supabase) return NO_SESSION;

  const label = input.label.trim();
  if (!label) return { ok: false, error: "Escribe el nombre de la categoría." };
  const fields = { label, description: input.description.trim(), icon: input.icon || "package" };

  if (input.id) {
    // El "enlace" (id) no cambia al renombrar, así los productos y los links siguen funcionando.
    const { error } = await supabase.from("categories").update(fields).eq("id", input.id);
    if (error) return { ok: false, error: categoryError(error.message, error.code) };
    refresh();
    return { ok: true, id: input.id };
  }

  const id = slugify(label);
  if (!id) return { ok: false, error: "El nombre debe tener letras o números." };

  const { data: last, error: lastError } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  if (lastError) return { ok: false, error: categoryError(lastError.message, lastError.code) };
  const sortOrder = ((last?.[0]?.sort_order as number | undefined) ?? -1) + 1;

  const { error } = await supabase.from("categories").insert({ id, ...fields, sort_order: sortOrder });
  if (error) return { ok: false, error: categoryError(error.message, error.code) };
  refresh();
  return { ok: true, id };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await getAdminClient();
  if (!supabase) return NO_SESSION;
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    if (error.code === "23503")
      return { ok: false, error: "Esta categoría todavía tiene productos. Pásalos a otra categoría antes de borrarla." };
    return { ok: false, error: categoryError(error.message, error.code) };
  }
  refresh();
  return { ok: true };
}

/** Sube o baja una categoría en el orden en que se muestra en la tienda. */
export async function moveCategory(id: string, direction: -1 | 1): Promise<ActionResult> {
  const supabase = await getAdminClient();
  if (!supabase) return NO_SESSION;

  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });
  if (error || !data) return { ok: false, error: categoryError(error?.message ?? "No se pudo leer las categorías.", error?.code) };

  const ids = data.map((r) => r.id as string);
  const from = ids.indexOf(id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= ids.length) return { ok: true };
  [ids[from], ids[to]] = [ids[to], ids[from]];

  const results = await Promise.all(ids.map((cid, i) => supabase.from("categories").update({ sort_order: i }).eq("id", cid)));
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: categoryError(failed.error.message, failed.error.code) };
  refresh();
  return { ok: true };
}

function closingError(message: string, code?: string) {
  if (code === "PGRST205" || code === "42P01")
    return "Todavía no existe la tabla de cuadres. Corre el archivo supabase/cuadres.sql en el SQL Editor de Supabase.";
  return message;
}

/** Guarda un cuadre: calcula los números del período en el servidor y los deja congelados. */
export async function saveClosing(input: ClosingInput): Promise<ActionResult> {
  const supabase = await getAdminClient();
  if (!supabase) return NO_SESSION;

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Ponle un nombre al cuadre." };
  if (!isValidDate(input.start) || !isValidDate(input.end)) return { ok: false, error: "Las fechas no son válidas." };
  if (input.end < input.start) return { ok: false, error: "La fecha final no puede ser antes de la inicial." };

  const raw = await loadRawData(supabase);
  if (raw.error) return { ok: false, error: raw.error };
  const snapshot = computeClosing(raw.products, raw.purchases, raw.sales, input.start, input.end);

  const { data, error } = await supabase
    .from("closings")
    .insert({ name, period_start: input.start, period_end: input.end, notes: input.notes?.trim() || null, snapshot })
    .select("id")
    .single();
  if (error) return { ok: false, error: closingError(error.message, error.code) };
  refresh();
  return { ok: true, id: data.id as string };
}

export async function deleteClosing(id: string): Promise<ActionResult> {
  const supabase = await getAdminClient();
  if (!supabase) return NO_SESSION;
  const { error } = await supabase.from("closings").delete().eq("id", id);
  if (error) return { ok: false, error: closingError(error.message, error.code) };
  refresh();
  return { ok: true };
}

export async function deletePurchase(id: string): Promise<ActionResult> {
  const supabase = await getAdminClient();
  if (!supabase) return NO_SESSION;
  const { error } = await supabase.from("purchases").delete().eq("id", id);
  if (error) return { ok: false, error: friendly(error.message, error.code) };
  refresh();
  return { ok: true };
}

export async function createSale(input: SaleInput): Promise<ActionResult> {
  const supabase = await getAdminClient();
  if (!supabase) return NO_SESSION;
  if (!input.product_id) return { ok: false, error: "Elige el producto." };
  if (!Number.isInteger(input.qty) || input.qty <= 0) return { ok: false, error: "La cantidad debe ser un número entero mayor a 0." };
  if (!Number.isFinite(input.unit_price) || input.unit_price < 0) return { ok: false, error: "El precio de venta no es válido." };

  // unit_cost se deja en null: la base de datos le pone el costo promedio y valida el stock.
  const { error } = await supabase.from("sales").insert({
    product_id: input.product_id,
    qty: input.qty,
    unit_price: input.unit_price,
    unit_cost: null,
    customer: input.customer?.trim() || null,
    channel: input.channel || null,
    sold_at: input.sold_at,
    notes: input.notes?.trim() || null,
  });
  if (error) return { ok: false, error: friendly(error.message, error.code) };
  refresh();
  return { ok: true };
}

export async function deleteSale(id: string): Promise<ActionResult> {
  const supabase = await getAdminClient();
  if (!supabase) return NO_SESSION;
  const { error } = await supabase.from("sales").delete().eq("id", id);
  if (error) return { ok: false, error: friendly(error.message, error.code) };
  refresh();
  return { ok: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
