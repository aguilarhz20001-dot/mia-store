import Link from "next/link";
import { TriangleAlert, ArrowRight } from "lucide-react";
import PageTitle from "@/components/admin/PageTitle";
import StatCard from "@/components/admin/StatCard";
import ErrorNote from "@/components/admin/ErrorNote";
import StockBadge from "@/components/admin/StockBadge";
import { loadAdminData } from "@/lib/admin/data";
import { LOW_STOCK_LIMIT } from "@/lib/admin/types";
import { formatDate, formatPct, formatQ } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Una línea de cuenta: «− Gastos … Q303.00». El signo ayuda a leer la resta/suma de arriba hacia abajo. */
function Line({
  label,
  value,
  sign,
  note,
  bold,
  big,
  tone = "default",
}: {
  label: string;
  value: string;
  sign?: "+" | "−" | "=";
  note?: string;
  bold?: boolean;
  big?: boolean;
  tone?: "default" | "good" | "bad";
}) {
  const color = tone === "good" ? "text-emerald-600" : tone === "bad" ? "text-red-600" : "text-brand-ink";
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="min-w-0">
        <span className={`${bold ? "font-semibold" : ""} text-brand-ink`}>
          {sign && <span className="mr-2 inline-block w-3 text-center text-brand-ink/40">{sign}</span>}
          {label}
        </span>
        {note && <span className="block pl-5 text-xs text-brand-ink/50">{note}</span>}
      </dt>
      <dd className={`shrink-0 tabular-nums ${bold ? "font-bold" : "font-medium"} ${big ? "text-xl" : ""} ${color}`}>{value}</dd>
    </div>
  );
}

export default async function ResumenPage() {
  const { error, rows, totals, sales, products, expensesTotal, cash, cashMissing } = await loadAdminData();
  const net = Math.round((totals.profit - expensesTotal) * 100) / 100;
  const nameOf = new Map(products.map((p) => [p.id, p.name]));

  const needRestock = rows.filter((r) => r.product.active && r.stock <= LOW_STOCK_LIMIT).sort((a, b) => a.stock - b.stock);
  const attentionTotal = needRestock.length;
  const attention = needRestock.slice(0, 5);

  const byProfit = [...rows].filter((r) => r.bought > 0).sort((a, b) => b.profit - a.profit);
  const recentSales = sales.slice(0, 5);

  return (
    <>
      <PageTitle title="Resumen" description="Cómo va tu tienda: lo invertido, lo vendido y lo que has ganado." />
      {error && <ErrorNote message={error} />}

      {/* 1 · Ganancia y caja: cada cifra aparece una sola vez y se lee de arriba hacia abajo */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5 sm:p-6">
          <h2 className="font-semibold text-brand-ink">¿Estamos ganando?</h2>
          <p className="text-sm text-brand-ink/55">Todo lo vendido hasta hoy.</p>
          <dl className="mt-4 divide-y divide-brand-pink/15">
            <Line label="Vendido" note={`${totals.sold} unidades`} value={formatQ(totals.revenue)} />
            <Line label="Costo de lo vendido" sign="−" value={formatQ(totals.cogs)} />
            <Line label="Ganancia de ventas" sign="=" note={`Margen ${formatPct(totals.margin)}`} value={formatQ(totals.profit)} bold />
            <Line label="Gastos" sign="−" note="Bolsas, gasolina, stickers…" value={formatQ(expensesTotal)} />
            <Line
              label="Ganancia final"
              sign="="
              note={net >= 0 ? "Sí estamos ganando" : "Todavía no se recuperan los gastos"}
              value={formatQ(net)}
              bold
              big
              tone={net > 0 ? "good" : net < 0 ? "bad" : "default"}
            />
          </dl>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-brand-ink">Dinero en caja</h2>
              <p className="text-sm text-brand-ink/55">Lo que debería haber para surtir y pagar gastos.</p>
            </div>
            <Link href="/admin/caja" className="inline-flex shrink-0 items-center gap-1 text-sm text-brand-pink-dark hover:underline">
              Ver caja <ArrowRight size={14} />
            </Link>
          </div>
          {cashMissing ? (
            <p className="mt-4 rounded-xl bg-brand-pink-light/60 p-4 text-sm text-brand-ink/70">
              La caja todavía no está activada. Abre <strong>supabase/caja.sql</strong>, pégalo en el SQL Editor de Supabase y dale Run.
            </p>
          ) : (
            <dl className="mt-4 divide-y divide-brand-pink/15">
              <Line label="Entró por ventas" sign="+" value={formatQ(cash.salesIn)} />
              <Line label="Salió en mercadería" sign="−" note="Compras pagadas con la caja" value={formatQ(cash.purchasesOut)} />
              <Line label="Salió en gastos" sign="−" note="Pagados con la caja" value={formatQ(cash.expensesOut)} />
              {(cash.deposits > 0 || cash.withdrawals > 0) && (
                <Line
                  label="Dinero metido o sacado a mano"
                  sign={cash.deposits - cash.withdrawals >= 0 ? "+" : "−"}
                  note="Incluye ajustes al contar la caja"
                  value={formatQ(Math.abs(cash.deposits - cash.withdrawals))}
                />
              )}
              <Line label="En caja ahora" sign="=" value={formatQ(cash.balance)} bold big tone={cash.balance < 0 ? "bad" : "default"} />
            </dl>
          )}
        </section>
      </div>

      {/* 2 · Mercadería */}
      <h2 className="mb-3 mt-8 font-semibold text-brand-ink">Mercadería</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Invertido en compras" value={formatQ(totals.invested)} note={`${totals.bought} unidades compradas`} />
        <StatCard label="En bodega (a costo)" value={formatQ(totals.stockCost)} note={`${totals.stockUnits} unidades · ${formatPct(totals.sellThrough)} ya vendido`} />
        <StatCard label="Venta potencial" value={formatQ(totals.stockSaleValue)} note="Si vendes todo al precio actual" />
        <StatCard label="Ganancia potencial" value={formatQ(totals.potentialProfit)} note="De lo que hay en bodega" tone="good" />
      </div>

      {/* 3 · Pendientes y últimas ventas, lado a lado */}
      {(attention.length > 0 || recentSales.length > 0) && (
        <div className="mt-8 grid items-start gap-4 lg:grid-cols-2">
          {attention.length > 0 && (
            <section className="card p-5">
              <h2 className="flex flex-wrap items-center gap-x-2 font-semibold text-brand-ink">
                <TriangleAlert size={18} className="text-amber-500" />
                Por reabastecer
                <span className="text-sm font-normal text-brand-ink/50">
                  ({totals.outOfStock} agotados · {totals.lowStock} con poco stock)
                </span>
              </h2>
              <ul className="mt-3 divide-y divide-brand-pink/10">
                {attention.map((r) => (
                  <li key={r.product.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0 truncate font-medium text-brand-ink">{r.product.name}</span>
                    <span className="flex shrink-0 items-center gap-3">
                      <StockBadge stock={r.stock} />
                      <Link href={`/admin/bodega?reponer=${r.product.id}`} className="text-brand-pink-dark hover:underline">
                        Reponer
                      </Link>
                    </span>
                  </li>
                ))}
              </ul>
              {attentionTotal > attention.length && (
                <Link href="/admin/bodega" className="mt-3 inline-flex items-center gap-1 text-sm text-brand-pink-dark hover:underline">
                  Ver los {attentionTotal} en Bodega <ArrowRight size={14} />
                </Link>
              )}
            </section>
          )}

          {recentSales.length > 0 && (
            <section className="card p-5">
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
        </div>
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
    </>
  );
}
