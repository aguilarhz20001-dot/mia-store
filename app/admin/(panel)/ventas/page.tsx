import Link from "next/link";
import PageTitle from "@/components/admin/PageTitle";
import StatCard from "@/components/admin/StatCard";
import ErrorNote from "@/components/admin/ErrorNote";
import SaleForm from "@/components/admin/SaleForm";
import ProductSalesList from "@/components/admin/ProductSalesList";
import { loadAdminData } from "@/lib/admin/data";
import { groupSalesByProduct } from "@/lib/admin/salesByProduct";
import { isValidDate, monthOf, periodName, prevMonth, quincenaOf } from "@/lib/admin/periods";
import { formatDate, formatPct, formatQ, todayGT } from "@/lib/format";

export const dynamic = "force-dynamic";

const ALL = { start: "2000-01-01", end: "2099-12-31" };

export default async function VentasPage({ searchParams }: { searchParams: Promise<{ desde?: string; hasta?: string }> }) {
  const sp = await searchParams;
  const today = todayGT();
  const { error, products, sales, variants, rows } = await loadAdminData();

  // Por defecto se ve todo el historial; los botones filtran por quincena o mes
  let start = isValidDate(sp.desde) ? sp.desde : ALL.start;
  let end = isValidDate(sp.hasta) ? sp.hasta : ALL.end;
  if (end < start) [start, end] = [end, start];
  const isAll = start === ALL.start && end === ALL.end;

  const inPeriod = sales.filter((s) => s.sold_at >= start && s.sold_at <= end);
  const groups = groupSalesByProduct(inPeriod, products, variants, true);
  const units = inPeriod.reduce((n, s) => n + s.qty, 0);
  const revenue = inPeriod.reduce((n, s) => n + s.qty * Number(s.unit_price), 0);
  const cogs = inPeriod.reduce((n, s) => n + s.qty * Number(s.unit_cost), 0);
  const profit = revenue - cogs;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  const quick = [
    { label: "Todo", ...ALL },
    { label: "Esta quincena", ...quincenaOf(today) },
    { label: "Este mes", ...monthOf(today) },
    { label: "Mes anterior", ...prevMonth(today) },
  ];

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
      <PageTitle title="Ventas" description="Cada venta baja el stock y guarda cuánto ganaste con ella. Toca un producto para ver sus ventas." />
      {error && <ErrorNote message={error} />}

      {options.length === 0 ? (
        <div className="card p-6 text-brand-ink/70">Primero crea un producto y registra una compra para tener qué vender.</div>
      ) : (
        <SaleForm options={options} today={today} />
      )}

      <section className="card mt-6 p-5">
        <div className="flex flex-wrap gap-2">
          {quick.map((q) => (
            <Link key={q.label} href={q.label === "Todo" ? "/admin/ventas" : `/admin/ventas?desde=${q.start}&hasta=${q.end}`} data-active={q.start === start && q.end === end} className="chip">
              {q.label}
            </Link>
          ))}
        </div>
        <p className="mt-3 text-sm text-brand-ink/60">
          Mostrando <strong className="text-brand-ink">{isAll ? "todo el historial" : periodName(start, end)}</strong>
          {!isAll && <> ({formatDate(start)} al {formatDate(end)})</>}.
        </p>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Vendido" value={formatQ(revenue)} note={`${units} unidades`} />
        <StatCard label="Costo de lo vendido" value={formatQ(cogs)} />
        <StatCard label="Ganancia" value={formatQ(profit)} tone={profit >= 0 ? "good" : "bad"} />
        <StatCard label="Margen de ganancia" value={formatPct(margin)} note="Ganancia ÷ ventas" />
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="p-5 pb-3">
          <h2 className="font-semibold text-brand-ink">Ventas por producto</h2>
          <p className="text-sm text-brand-ink/55">Ordenado del más vendido al menos vendido.</p>
        </div>
        <ProductSalesList groups={groups} canDelete emptyText={isAll ? "Todavía no hay ventas." : "No hay ventas en este período."} />
      </section>
    </>
  );
}
