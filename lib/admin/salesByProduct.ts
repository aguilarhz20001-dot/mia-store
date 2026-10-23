import type { ProductRow } from "@/lib/products";
import type { SaleRow, VariantRow } from "./types";

const money = (n: number) => Math.round(n * 100) / 100;

/** Una venta lista para mostrar. Sin `id` cuando viene de un cuadre guardado (no se puede borrar). */
export type SaleLine = {
  id?: string;
  date: string;
  style: string | null;
  customer: string | null;
  channel: string | null;
  notes: string | null;
  qty: number;
  unitPrice: number;
  revenue: number;
  cost: number;
  profit: number;
};

/** Todo lo vendido de un producto: totales, desglose por estilo y cada venta. */
export type ProductSalesGroup = {
  name: string;
  units: number;
  revenue: number;
  cogs: number;
  profit: number;
  margin: number;
  styles: { name: string; units: number; revenue: number; profit: number }[];
  lines: SaleLine[];
};

/** Agrupa ventas por producto (el más vendido primero). `withIds` deja el id de cada venta para poder borrarla. */
export function groupSalesByProduct(sales: SaleRow[], products: ProductRow[], variants: VariantRow[], withIds: boolean): ProductSalesGroup[] {
  const productName = new Map(products.map((p) => [p.id, p.name]));
  const styleName = new Map(variants.map((v) => [v.id, v.name]));
  const byProduct = new Map<string, SaleRow[]>();
  for (const s of sales) {
    const list = byProduct.get(s.product_id) ?? [];
    list.push(s);
    byProduct.set(s.product_id, list);
  }

  const groups: ProductSalesGroup[] = [];
  for (const [productId, list] of byProduct) {
    const lines: SaleLine[] = [...list]
      .sort((a, b) => (a.sold_at === b.sold_at ? b.created_at.localeCompare(a.created_at) : b.sold_at.localeCompare(a.sold_at)))
      .map((s) => {
        const revenue = s.qty * Number(s.unit_price);
        const cost = s.qty * Number(s.unit_cost);
        return {
          ...(withIds ? { id: s.id } : {}),
          date: s.sold_at,
          style: s.variant_id ? (styleName.get(s.variant_id) ?? null) : null,
          customer: s.customer,
          channel: s.channel,
          notes: s.notes,
          qty: s.qty,
          unitPrice: Number(s.unit_price),
          revenue: money(revenue),
          cost: money(cost),
          profit: money(revenue - cost),
        };
      });

    const units = lines.reduce((n, l) => n + l.qty, 0);
    const revenue = lines.reduce((n, l) => n + l.revenue, 0);
    const cogs = lines.reduce((n, l) => n + l.cost, 0);

    const styles = new Map<string, { units: number; revenue: number; profit: number }>();
    if (lines.some((l) => l.style)) {
      for (const l of lines) {
        const key = l.style ?? "Sin estilo";
        const cur = styles.get(key) ?? { units: 0, revenue: 0, profit: 0 };
        cur.units += l.qty;
        cur.revenue += l.revenue;
        cur.profit += l.profit;
        styles.set(key, cur);
      }
    }

    groups.push({
      name: productName.get(productId) ?? "Producto",
      units,
      revenue: money(revenue),
      cogs: money(cogs),
      profit: money(revenue - cogs),
      margin: revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0,
      styles: [...styles.entries()]
        .map(([name, v]) => ({ name, units: v.units, revenue: money(v.revenue), profit: money(v.profit) }))
        .sort((a, b) => b.units - a.units),
      lines,
    });
  }
  return groups.sort((a, b) => b.units - a.units || b.revenue - a.revenue);
}
