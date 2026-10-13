export type PurchaseRow = {
  id: string;
  product_id: string;
  variant_id: string | null;
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
  variant_id: string | null;
  order_id: string | null;
  qty: number;
  unit_price: number;
  unit_cost: number;
  customer: string | null;
  channel: string | null;
  sold_at: string;
  notes: string | null;
  created_at: string;
};

export type ExpenseRow = {
  id: string;
  description: string;
  category: string | null;
  amount: number;
  spent_at: string;
  notes: string | null;
  created_at: string;
};

export const EXPENSE_CATEGORIES = ["Empaque", "Transporte", "Publicidad", "Materiales", "Servicios", "Otro"] as const;

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

export const SALE_CHANNELS = ["WhatsApp", "Facebook", "Instagram", "En persona", "Otro"] as const;
export const LOW_STOCK_LIMIT = 3;

/** Estilo (variante) de un producto, con sus propias fotos y stock. */
export type VariantRow = {
  id: string;
  product_id: string;
  name: string;
  images: string[] | null;
  sort_order: number;
  active: boolean;
  stock: number;
  created_at: string;
};

export type OrderStatus = "pendiente" | "vendido" | "cancelado";

export type OrderRow = {
  id: string;
  number: number;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  delivery: string;
  delivery_fee: number;
  address: string;
  notes: string | null;
  subtotal: number;
  total: number;
  created_at: string;
  completed_at: string | null;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  size: string | null;
  qty: number;
  unit_price: number;
};
