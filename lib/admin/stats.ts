import type { ProductRow } from "@/lib/products";
import { LOW_STOCK_LIMIT, type PurchaseRow, type SaleRow } from "./types";

export type ProductStats = {
  product: ProductRow;
  /** Unidades compradas / vendidas / en bodega */
  bought: number;
  sold: number;
  stock: number;
  /** Compras: lo invertido y el costo promedio por unidad */
  invested: number;
  avgCost: number;
  /** Ventas: ingresos, costo de lo vendido, ganancia y margen (ganancia / ingresos) */
  revenue: number;
  cogs: number;
  profit: number;
  margin: number;
  /** % de lo comprado que ya se vendió */
  sellThrough: number;
  /** Bodega: valor a costo, valor a precio de venta y ganancia si se vende todo */
  stockCost: number;
  stockSaleValue: number;
  potentialProfit: number;
  /** Ganancia por unidad según el precio actual y su margen */
  unitProfit: number;
  unitMargin: number;
};

export type Totals = {
  products: number;
  bought: number;
  sold: number;
  stockUnits: number;
  invested: number;
  revenue: number;
  cogs: number;
  profit: number;
  margin: number;
  sellThrough: number;
  stockCost: number;
  stockSaleValue: number;
  potentialProfit: number;
  outOfStock: number;
  lowStock: number;
};

const money = (n: number) => Math.round(n * 100) / 100;

export function buildStats(products: ProductRow[], purchases: PurchaseRow[], sales: SaleRow[]) {
  const rows: ProductStats[] = products.map((product) => {
    const buys = purchases.filter((p) => p.product_id === product.id);
    const sells = sales.filter((s) => s.product_id === product.id);

    const bought = buys.reduce((n, b) => n + b.qty, 0);
    const invested = buys.reduce((n, b) => n + b.qty * Number(b.unit_cost), 0);
    const avgCost = bought > 0 ? invested / bought : 0;

    const sold = sells.reduce((n, s) => n + s.qty, 0);
    const revenue = sells.reduce((n, s) => n + s.qty * Number(s.unit_price), 0);
    const cogs = sells.reduce((n, s) => n + s.qty * Number(s.unit_cost), 0);
    const profit = revenue - cogs;

    const stock = bought - sold;
    const price = Number(product.price);

    return {
      product,
      bought,
      sold,
      stock,
      invested: money(invested),
      avgCost: money(avgCost),
      revenue: money(revenue),
      cogs: money(cogs),
      profit: money(profit),
      margin: revenue > 0 ? (profit / revenue) * 100 : 0,
      sellThrough: bought > 0 ? (sold / bought) * 100 : 0,
      stockCost: money(Math.max(stock, 0) * avgCost),
      stockSaleValue: money(Math.max(stock, 0) * price),
      potentialProfit: money(Math.max(stock, 0) * (price - avgCost)),
      unitProfit: money(price - avgCost),
      unitMargin: price > 0 ? ((price - avgCost) / price) * 100 : 0,
    };
  });

  const sum = (pick: (r: ProductStats) => number) => rows.reduce((n, r) => n + pick(r), 0);
  const bought = sum((r) => r.bought);
  const sold = sum((r) => r.sold);
  const revenue = sum((r) => r.revenue);
  const profit = sum((r) => r.profit);

  const totals: Totals = {
    products: rows.length,
    bought,
    sold,
    stockUnits: sum((r) => Math.max(r.stock, 0)),
    invested: money(sum((r) => r.invested)),
    revenue: money(revenue),
    cogs: money(sum((r) => r.cogs)),
    profit: money(profit),
    margin: revenue > 0 ? (profit / revenue) * 100 : 0,
    sellThrough: bought > 0 ? (sold / bought) * 100 : 0,
    stockCost: money(sum((r) => r.stockCost)),
    stockSaleValue: money(sum((r) => r.stockSaleValue)),
    potentialProfit: money(sum((r) => r.potentialProfit)),
    outOfStock: rows.filter((r) => r.product.active && r.stock <= 0).length,
    lowStock: rows.filter((r) => r.product.active && r.stock > 0 && r.stock <= LOW_STOCK_LIMIT).length,
  };

  return { rows, totals };
}

export function stockStatus(stock: number): "agotado" | "poco" | "ok" {
  if (stock <= 0) return "agotado";
  if (stock <= LOW_STOCK_LIMIT) return "poco";
  return "ok";
}
