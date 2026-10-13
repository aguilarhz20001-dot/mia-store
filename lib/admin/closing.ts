import type { ProductRow } from "@/lib/products";
import type { ExpenseRow, PurchaseRow, SaleRow } from "./types";

/** Foto de los números de un período. Se guarda tal cual al cerrar un cuadre. */
export type ClosingSnapshot = {
  version: 1;
  sales: { count: number; units: number; revenue: number; cogs: number; profit: number; margin: number };
  purchases: { count: number; units: number; invested: number };
  /** Gastos del período (bolsas, gasolina, etc.). Opcional: los cuadres viejos no lo traen. */
  expenses?: { count: number; total: number; byCategory: { category: string; total: number }[] };
  /** Ganancia después de gastos = ganancia de ventas − gastos. Opcional por la misma razón. */
  net?: number;
  /** Lo que quedó en bodega al final del período (valorado al precio de venta actual) */
  stock: { units: number; cost: number; saleValue: number };
  top: { name: string; units: number; revenue: number; profit: number }[];
  byChannel: { channel: string; units: number; revenue: number }[];
  /** Productos que quedaron con stock pero no se vendieron en el período */
  notSold: string[];
};

const money = (n: number) => Math.round(n * 100) / 100;

export function computeClosing(
  products: ProductRow[],
  purchases: PurchaseRow[],
  sales: SaleRow[],
  start: string,
  end: string,
  expenses: ExpenseRow[] = [],
): ClosingSnapshot {
  const inRange = (d: string) => d >= start && d <= end;
  const salesIn = sales.filter((s) => inRange(s.sold_at));
  const purchasesIn = purchases.filter((p) => inRange(p.purchased_at));

  const revenue = salesIn.reduce((n, s) => n + s.qty * Number(s.unit_price), 0);
  const cogs = salesIn.reduce((n, s) => n + s.qty * Number(s.unit_cost), 0);
  const profit = revenue - cogs;

  const expensesIn = expenses.filter((e) => inRange(e.spent_at));
  const expensesTotal = expensesIn.reduce((n, e) => n + Number(e.amount), 0);
  const byCat = new Map<string, number>();
  for (const e of expensesIn) {
    const key = e.category || "Sin categoría";
    byCat.set(key, (byCat.get(key) ?? 0) + Number(e.amount));
  }

  // Por producto vendido en el período
  const byProduct = new Map<string, { units: number; revenue: number; cogs: number }>();
  for (const s of salesIn) {
    const cur = byProduct.get(s.product_id) ?? { units: 0, revenue: 0, cogs: 0 };
    cur.units += s.qty;
    cur.revenue += s.qty * Number(s.unit_price);
    cur.cogs += s.qty * Number(s.unit_cost);
    byProduct.set(s.product_id, cur);
  }
  const nameOf = new Map(products.map((p) => [p.id, p.name]));
  const top = [...byProduct.entries()]
    .map(([id, v]) => ({ name: nameOf.get(id) ?? "Producto", units: v.units, revenue: money(v.revenue), profit: money(v.revenue - v.cogs) }))
    .sort((a, b) => b.units - a.units || b.revenue - a.revenue)
    .slice(0, 10);

  const channels = new Map<string, { units: number; revenue: number }>();
  for (const s of salesIn) {
    const key = s.channel || "Sin canal";
    const cur = channels.get(key) ?? { units: 0, revenue: 0 };
    cur.units += s.qty;
    cur.revenue += s.qty * Number(s.unit_price);
    channels.set(key, cur);
  }

  // Bodega al final del período: todo lo comprado hasta esa fecha menos todo lo vendido hasta esa fecha
  let stockUnits = 0;
  let stockCost = 0;
  let stockSale = 0;
  const notSold: string[] = [];
  for (const p of products) {
    const buys = purchases.filter((b) => b.product_id === p.id && b.purchased_at <= end);
    const sells = sales.filter((s) => s.product_id === p.id && s.sold_at <= end);
    const bought = buys.reduce((n, b) => n + b.qty, 0);
    const invested = buys.reduce((n, b) => n + b.qty * Number(b.unit_cost), 0);
    const left = Math.max(bought - sells.reduce((n, s) => n + s.qty, 0), 0);
    if (left <= 0) continue;
    stockUnits += left;
    stockCost += left * (bought > 0 ? invested / bought : 0);
    stockSale += left * Number(p.price);
    if (!byProduct.has(p.id)) notSold.push(p.name);
  }

  return {
    version: 1,
    sales: {
      count: salesIn.length,
      units: salesIn.reduce((n, s) => n + s.qty, 0),
      revenue: money(revenue),
      cogs: money(cogs),
      profit: money(profit),
      margin: revenue > 0 ? (profit / revenue) * 100 : 0,
    },
    purchases: {
      count: purchasesIn.length,
      units: purchasesIn.reduce((n, p) => n + p.qty, 0),
      invested: money(purchasesIn.reduce((n, p) => n + p.qty * Number(p.unit_cost), 0)),
    },
    expenses: {
      count: expensesIn.length,
      total: money(expensesTotal),
      byCategory: [...byCat.entries()].map(([category, total]) => ({ category, total: money(total) })).sort((a, b) => b.total - a.total),
    },
    net: money(profit - expensesTotal),
    stock: { units: stockUnits, cost: money(stockCost), saleValue: money(stockSale) },
    top,
    byChannel: [...channels.entries()].map(([channel, v]) => ({ channel, units: v.units, revenue: money(v.revenue) })).sort((a, b) => b.revenue - a.revenue),
    notSold: notSold.sort((a, b) => a.localeCompare(b)).slice(0, 30),
  };
}
