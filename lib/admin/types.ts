export type PurchaseRow = {
  id: string;
  product_id: string;
  qty: number;
  unit_cost: number;
  supplier: string | null;
  purchased_at: string;
  notes: string | null;
  created_at: string;
};

export type SaleRow = {
  id: string;
  product_id: string;
  qty: number;
  unit_price: number;
  unit_cost: number;
  customer: string | null;
  channel: string | null;
  sold_at: string;
  notes: string | null;
  created_at: string;
};

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

export const SALE_CHANNELS = ["WhatsApp", "Facebook", "Instagram", "En persona", "Otro"] as const;
export const LOW_STOCK_LIMIT = 3;
