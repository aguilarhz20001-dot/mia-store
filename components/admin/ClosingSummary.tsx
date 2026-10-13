import StatCard from "./StatCard";
import type { ClosingSnapshot } from "@/lib/admin/closing";
import { formatPct, formatQ } from "@/lib/format";

/** Muestra los números de un cuadre (en vivo o guardado). */
export default function ClosingSummary({ data }: { data: ClosingSnapshot }) {
  const { sales, purchases, stock, top, byChannel, notSold, expenses, net } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Vendido" value={formatQ(sales.revenue)} note={`${sales.units} unidades · ${sales.count} ventas`} />
        <StatCard label="Costo de lo vendido" value={formatQ(sales.cogs)} />
        <StatCard label="Ganancia" value={formatQ(sales.profit)} note={`Margen ${formatPct(sales.margin)}`} tone={sales.profit >= 0 ? "good" : "bad"} />
        <StatCard label="Invertido en compras" value={formatQ(purchases.invested)} note={`${purchases.units} unidades · ${purchases.count} compras`} />
      </div>

      {expenses && net !== undefined && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Gastos del período" value={formatQ(expenses.total)} note={`${expenses.count} gastos (bolsas, gasolina, etc.)`} />
          <StatCard
            label="Ganancia después de gastos"
            value={formatQ(net)}
            note="Ganancia de ventas − gastos"
            tone={net > 0 ? "good" : net < 0 ? "bad" : "default"}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="En bodega al final" value={`${stock.units} u.`} />
        <StatCard label="Valor a costo" value={formatQ(stock.cost)} />
        <StatCard label="Valor a precio de venta" value={formatQ(stock.saleValue)} note="Con el precio actual de cada producto" />
      </div>

      <section className="card overflow-hidden">
        <div className="p-5 pb-3"><h2 className="font-semibold text-brand-ink">Más vendidos del período</h2></div>
        <div className="overflow-x-auto">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="num">Unidades</th>
                <th className="num">Vendido</th>
                <th className="num">Ganancia</th>
              </tr>
            </thead>
            <tbody>
              {top.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-brand-ink/50">No hay ventas en este período.</td></tr>
              )}
              {top.map((t) => (
                <tr key={t.name}>
                  <td className="font-medium text-brand-ink">{t.name}</td>
                  <td className="num">{t.units}</td>
                  <td className="num">{formatQ(t.revenue)}</td>
                  <td className={`num ${t.profit < 0 ? "text-red-600" : ""}`}>{formatQ(t.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-semibold text-brand-ink">Ventas por canal</h2>
          {byChannel.length === 0 ? (
            <p className="mt-3 text-sm text-brand-ink/50">Sin ventas en este período.</p>
          ) : (
            <ul className="mt-3 divide-y divide-brand-pink/15 text-sm">
              {byChannel.map((c) => (
                <li key={c.channel} className="flex items-center justify-between py-2">
                  <span className="text-brand-ink">{c.channel}</span>
                  <span className="tabular-nums text-brand-ink/70">{c.units} u. · {formatQ(c.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="font-semibold text-brand-ink">Con stock pero sin ventas</h2>
          {notSold.length === 0 ? (
            <p className="mt-3 text-sm text-brand-ink/50">Todo lo que tenías en bodega se movió en este período.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {notSold.map((n) => (
                <li key={n} className="rounded-full bg-brand-pink-light px-3 py-1 text-brand-ink/80">{n}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
