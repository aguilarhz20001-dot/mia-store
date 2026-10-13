import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import PageTitle from "@/components/admin/PageTitle";
import StatCard from "@/components/admin/StatCard";
import ErrorNote from "@/components/admin/ErrorNote";
import StockBadge from "@/components/admin/StockBadge";
import { loadAdminData } from "@/lib/admin/data";
import { LOW_STOCK_LIMIT } from "@/lib/admin/types";
import { formatDate, formatPct, formatQ } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ResumenPage() {
  const { error, rows, totals, sales, products, expensesTotal } = await loadAdminData();
  const net = Math.round((totals.profit - expensesTotal) * 100) / 100;
  const nameOf = new Map(products.map((p) => [p.id, p.name]));

  const attention = rows
    .filter((r) => r.product.active && r.stock <= LOW_STOCK_LIMIT)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8);

  const byProfit = [...rows].filter((r) => r.bought > 0).sort((a, b) => b.profit - a.profit);
  const recentSales = sales.slice(0, 6);

  return (
    <>
      <PageTitle title="Resumen" description="Cómo va tu tienda: lo invertido, lo vendido y lo que has ganado." />
      {error && <ErrorNote message={error} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Invertido en compras" value={formatQ(totals.invested)} note={`${totals.bought} unidades compradas`} />
        <StatCard label="Vendido" value={formatQ(totals.revenue)} note={`${totals.sold} unidades vendidas`} />
        <StatCard
          label="Ganancia"
          value={formatQ(totals.profit)}
          note="Ventas − costo de lo vendido"
          tone={totals.profit > 0 ? "good" : totals.profit < 0 ? "bad" : "default"}
        />
        <StatCard label="Margen de ganancia" value={formatPct(totals.margin)} note="Ganancia ÷ ventas" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Ganancia de ventas" value={formatQ(totals.profit)} note="Antes de gastos" />
        <StatCard label="Gastos" value={formatQ(expensesTotal)} note="Bolsas, gasolina, stickers…" />
        <StatCard
          label="Ganancia después de gastos"
          value={formatQ(net)}
          note={net >= 0 ? "Sí estamos ganando" : "Todavía no se recuperan los gastos"}
          tone={net > 0 ? "good" : net < 0 ? "bad" : "default"}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="% vendido" value={formatPct(totals.sellThrough)} note="De lo que has comprado" />
        <StatCard label="En bodega (a costo)" value={formatQ(totals.stockCost)} note={`${totals.stockUnits} unidades en stock`} />
        <StatCard label="Venta potencial" value={formatQ(totals.stockSaleValue)} note="Si vendes todo al precio actual" />
        <StatCard label="Ganancia potencial" value={formatQ(totals.potentialProfit)} note="De lo que hay en bodega" tone="good" />
      </div>

      {attention.length > 0 && (
        <section className="card mt-8 p-5">
          <h2 className="flex items-center gap-2 font-semibold text-brand-ink">
            <TriangleAlert size={18} className="text-amber-500" />
            Productos por reabastecer
            <span className="text-sm font-normal text-brand-ink/50">
              ({totals.outOfStock} agotados · {totals.lowStock} con poco stock)
            </span>
          </h2>
          <ul className="mt-3 divide-y divide-brand-pink/10">
            {attention.map((r) => (
              <li key={r.product.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0 truncate font-medium text-brand-ink">{r.product.name}</span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="tabular-nums text-brand-ink/60">{r.stock} u.</span>
                  <StockBadge stock={r.stock} />
                  <Link href={`/admin/bodega?reponer=${r.product.id}`} className="text-brand-pink-dark hover:underline">
                    Reponer
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card mt-8 overflow-hidden">
        <div className="p-5 pb-3">
          <h2 className="font-semibold text-brand-ink">Resultado por producto</h2>
          <p className="text-sm text-brand-ink/55">Ordenado de mayor a menor ganancia.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="num">Comprado</th>
                <th className="num">Vendido</th>
                <th>% vendido</th>
                <th className="num">Stock</th>
                <th className="num">Invertido</th>
                <th className="num">Ventas</th>
                <th className="num">Ganancia</th>
                <th className="num">Margen</th>
              </tr>
            </thead>
            <tbody>
              {byProfit.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-brand-ink/50">
                    Aún no hay compras registradas. Empieza en <Link href="/admin/bodega" className="text-brand-pink-dark underline">Bodega</Link>.
                  </td>
                </tr>
              )}
              {byProfit.map((r) => (
                <tr key={r.product.id}>
                  <td className="font-medium text-brand-ink">{r.product.name}</td>
                  <td className="num">{r.bought}</td>
                  <td className="num">{r.sold}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-brand-pink-light">
                        <div className="h-full rounded-full bg-gradient-to-r from-brand-pink to-brand-lilac" style={{ width: `${Math.min(100, r.sellThrough)}%` }} />
                      </div>
                      <span className="text-xs tabular-nums text-brand-ink/65">{formatPct(r.sellThrough)}</span>
                    </div>
                  </td>
                  <td className="num">{r.stock}</td>
                  <td className="num">{formatQ(r.invested)}</td>
                  <td className="num">{formatQ(r.revenue)}</td>
                  <td className={`num font-semibold ${r.profit < 0 ? "text-red-600" : "text-emerald-600"}`}>{formatQ(r.profit)}</td>
                  <td className="num">{r.sold > 0 ? formatPct(r.margin) : "—"}</td>
                </tr>
              ))}
            </tbody>
            {byProfit.length > 0 && (
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td className="num">{totals.bought}</td>
                  <td className="num">{totals.sold}</td>
                  <td>{formatPct(totals.sellThrough)}</td>
                  <td className="num">{totals.stockUnits}</td>
                  <td className="num">{formatQ(totals.invested)}</td>
                  <td className="num">{formatQ(totals.revenue)}</td>
                  <td className="num">{formatQ(totals.profit)}</td>
                  <td className="num">{formatPct(totals.margin)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>

      {recentSales.length > 0 && (
        <section className="card mt-8 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-brand-ink">Últimas ventas</h2>
            <Link href="/admin/ventas" className="text-sm text-brand-pink-dark hover:underline">Ver todas</Link>
          </div>
          <ul className="mt-3 divide-y divide-brand-pink/10 text-sm">
            {recentSales.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0 truncate">
                  <span className="text-brand-ink/50">{formatDate(s.sold_at)} · </span>
                  {s.qty} × {nameOf.get(s.product_id) ?? "Producto"}
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-brand-ink">{formatQ(s.qty * Number(s.unit_price))}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
