"use server";

import { getPublicClient } from "@/lib/supabase/public";
import { getDeliveryOption } from "@/lib/shipping";

export type OrderLineInput = {
  slug: string;
  qty: number;
  size?: string;
  variantId?: string;
};

export type CreateOrderInput = {
  name: string;
  phone: string;
  delivery: string;
  address: string;
  notes: string;
  lines: OrderLineInput[];
};

export type CreateOrderResult = { ok: true; number: number } | { ok: false; error: string };

/**
 * Guarda el pedido como "pendiente" en el sistema cuando el cliente lo envía por WhatsApp.
 * El stock NO se descuenta aquí: se descuenta cuando lo marcas como vendido en /admin/pedidos.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const supabase = getPublicClient();
  if (!supabase) return { ok: false, error: "La tienda todavía no está conectada a la base de datos." };

  const lines = (input.lines ?? [])
    .filter((l) => l && typeof l.slug === "string" && Number.isInteger(l.qty) && l.qty > 0)
    .slice(0, 40)
    .map((l) => ({
      slug: l.slug,
      qty: Math.min(l.qty, 99),
      size: l.size?.slice(0, 20) || null,
      variant_id: l.variantId || null,
    }));
  if (lines.length === 0) return { ok: false, error: "El pedido no tiene productos." };

  const option = getDeliveryOption(input.delivery); // el costo de envío lo decide el servidor

  const { data, error } = await supabase.rpc("create_order", {
    p_name: input.name.trim().slice(0, 120),
    p_phone: input.phone.trim().slice(0, 40),
    p_delivery: option.id,
    p_fee: option.fee,
    p_address: input.address.trim().slice(0, 500),
    p_notes: input.notes.trim().slice(0, 500) || null,
    p_items: lines,
  });

  if (error || !data) {
    console.error("No se pudo guardar el pedido:", error?.message);
    return { ok: false, error: error?.message ?? "No se pudo guardar el pedido." };
  }
  return { ok: true, number: Number((data as { number: number }).number) };
}
