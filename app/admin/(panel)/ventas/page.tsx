import PageTitle from "@/components/admin/PageTitle";
import StatCard from "@/components/admin/StatCard";
import ErrorNote from "@/components/admin/ErrorNote";
import DeleteButton from "@/components/admin/DeleteButton";
import SaleForm from "@/components/admin/SaleForm";
import { deleteSale } from "@/app/admin/actions";
import { loadAdminData } from "@/lib/admin/data";
import { formatDate, formatPct, formatQ, todayGT } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function VentasPage() {
  const { error, products, sales, variants, rows, totals } = await loadAdminData();
  const nameOf = new Map(products.map((p) => [p.id, p.name]));
  const variantName = new Map(variants.map((v) => [v.id, v.name]));

  const options = rows
    .filter((r) => r.product.active || r.stock > 0)
    .map((r) => ({
      id: r.product.id,
      name: r.product.name,
      stock: r.stock,
      price: Number(r.product.price),
      avgCost: r.avgCost,
      variants: variants
        .filter((v) => v.product_id === r.product.id)
        .map((v) => ({ id: v.id, name: v.name, stock: v.stock })),
    }));

  return (
    <>
      <PageTitle title="Ventas" description="Cada venta baja el stock y guarda cuánto ganaste con ella." />
      {error && <ErrorNote message={error} />}

      {options.length === 0 ? (
        <div className="card p-6 text-brand-ink/70">Primero crea un producto y registra una compra para tener qué vender.</div>
      ) : (
        <SaleForm options={options} today={todayGT()} />
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Vendido" value={formatQ(totals.revenue)} note={`${totals.sold} unidades`} />
        <StatCard label="Costo de lo vendido" value={formatQ(totals.cogs)} />
        <StatCard label="Ganancia" value={formatQ(totals.profit)} tone={totals.profit >= 0 ? "good" : "bad"} />
        <StatCard label="Margen de ganancia" value={formatPct(totals.margin)} note="Ganancia ÷ ventas" />
      </div>

      <section className="card mt-8 overflow-hidden">
        <div className="p-5 pb-3"><h2 className="font-semibold text-brand-ink">Historial de ventas</h2></div>
        <div className="overflow-x-auto">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Cliente</th>
                <th className="num">Cant.</th>
                <th className="num">Precio c/u</th>
                <th className="num">Venta</th>
                <th className="num">Costo</th>
                <th className="num">Ganancia</th>
                <th className="num">Margen</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 && (
                <tr><td colSpan={10} className="py-8 text-center text-brand-ink/50">Todavía no hay ventas.</td></tr>
              )}
              {sales.map((s) => {
                const revenue = s.qty * Number(s.unit_price);
                const cost = s.qty * Number(s.unit_cost);
                const profit = revenue - cost;
                return (
                  <tr key={s.id}>
                    <td className="whitespace-nowrap">{formatDate(s.sold_at)}</td>
                    <td className="font-medium text-brand-ink">
                      {nameOf.get(s.product_id) ?? "Producto"}
                      {s.variant_id && variantName.get(s.variant_id) && (
                        <span className="font-normal text-brand-ink/60"> · {variantName.get(s.variant_id)}</span>
                      )}
                      {s.notes && <div className="text-xs font-normal text-brand-ink/50">{s.notes}</div>}
                    </td>
                    <td>
                      {s.customer ?? "—"}
                      {s.channel && <div className="text-xs text-brand-ink/50">{s.channel}</div>}
                    </td>
                    <td className="num">{s.qty}</td>
                    <td className="num">{formatQ(Number(s.unit_price))}</td>
                    <td className="num">{formatQ(revenue)}</td>
                    <td className="num">{formatQ(cost)}</td>
                    <td className={`num font-semibold ${profit < 0 ? "text-red-600" : "text-emerald-600"}`}>{formatQ(profit)}</td>
                    <td className="num">{revenue > 0 ? formatPct((profit / revenue) * 100) : "—"}</td>
                    <td className="num">
                      <DeleteButton action={deleteSale} id={s.id} confirmText="¿Borrar esta venta? Las unidades volverán a la bodega." />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {sales.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={3}>Total</td>
                  <td className="num">{totals.sold}</td>
                  <td></td>
                  <td className="num">{formatQ(totals.revenue)}</td>
                  <td className="num">{formatQ(totals.cogs)}</td>
                  <td className="num">{formatQ(totals.profit)}</td>
                  <td className="num">{formatPct(totals.margin)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </>
  );
}
