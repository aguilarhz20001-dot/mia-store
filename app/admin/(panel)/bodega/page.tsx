import Link from "next/link";
import PageTitle from "@/components/admin/PageTitle";
import StatCard from "@/components/admin/StatCard";
import ErrorNote from "@/components/admin/ErrorNote";
import StockBadge from "@/components/admin/StockBadge";
import StockIntake from "@/components/admin/StockIntake";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { loadAdminData } from "@/lib/admin/data";
import { stockStatus } from "@/lib/admin/stats";
import { findCategory } from "@/lib/categories";
import { formatPct, formatQ, todayGT } from "@/lib/format";

export const dynamic = "force-dynamic";

const FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "poco", label: "Poco stock" },
  { id: "agotado", label: "Agotados" },
];

export default async function BodegaPage({ searchParams }: { searchParams: Promise<{ filtro?: string; reponer?: string; estilo?: string }> }) {
  const { filtro = "todos", reponer, estilo } = await searchParams;
  const { error, categories, products, purchases, variants, rows, totals } = await loadAdminData();
  const variantsOf = new Map<string, typeof variants>();
  for (const v of variants) variantsOf.set(v.product_id, [...(variantsOf.get(v.product_id) ?? []), v]);

  // Último costo pagado por producto (las compras vienen de la más nueva a la más vieja)
  const lastCost = new Map<string, number>();
  for (const p of purchases) if (!lastCost.has(p.product_id)) lastCost.set(p.product_id, Number(p.unit_cost));
  const options = products.map((p) => ({
    id: p.id,
    name: p.name,
    lastCost: lastCost.get(p.id) ?? null,
    variants: (variantsOf.get(p.id) ?? []).map((v) => ({ id: v.id, name: v.name })),
  }));

  const visible = rows
    .filter((r) => filtro === "todos" || stockStatus(r.stock) === filtro)
    .sort((a, b) => a.stock - b.stock || a.product.name.localeCompare(b.product.name));

  return (
    <>
      <PageTitle title="Bodega" description="Aquí ingresas mercadería (nueva o reponiendo) y ves lo que tienes en stock, cuánto costó y cuánto vale al venderlo." />
      {error && <ErrorNote message={error} />}

      <StockIntake key={`${reponer ?? "nuevo"}-${estilo ?? ""}`} today={todayGT()} categories={categories} options={options} initialProductId={reponer} initialVariantId={estilo} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Productos" value={String(totals.products)} />
        <StatCard label="Unidades en stock" value={String(totals.stockUnits)} note={`${totals.outOfStock} agotados · ${totals.lowStock} con poco stock`} />
        <StatCard label="Valor a costo" value={formatQ(totals.stockCost)} />
        <StatCard label="Valor a precio de venta" value={formatQ(totals.stockSaleValue)} note={`Ganancia potencial ${formatQ(totals.potentialProfit)}`} tone="good" />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link key={f.id} href={f.id === "todos" ? "/admin/bodega" : `/admin/bodega?filtro=${f.id}`} data-active={filtro === f.id} className="chip">
            {f.label}
          </Link>
        ))}
      </div>

      <section className="card mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Estado</th>
                <th className="num">Stock</th>
                <th className="num">Costo prom.</th>
                <th className="num">Precio venta</th>
                <th className="num">Ganancia c/u</th>
                <th className="num">Margen</th>
                <th className="num">Valor a costo</th>
                <th className="num">Valor a venta</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-brand-ink/50">No hay productos en este filtro.</td>
                </tr>
              )}
              {visible.map((r) => (
                <tr key={r.product.id}>
                  <td>
                    <Link href={`/admin/productos/${r.product.id}`} className="font-medium text-brand-ink hover:text-brand-pink-dark">
                      {r.product.name}
                    </Link>
                    <div className="text-xs text-brand-ink/50">
                      {findCategory(categories, r.product.category)?.label ?? r.product.category}
                      {!r.product.active && " · Oculto en la tienda"}
                    </div>
                    {(variantsOf.get(r.product.id) ?? []).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {variantsOf.get(r.product.id)!.map((v) => (
                          <span
                            key={v.id}
                            className={`rounded-full px-2 py-0.5 text-xs ${v.stock <= 0 ? "bg-red-100 text-red-700" : "bg-brand-lilac-light text-brand-lilac-dark"}`}
                          >
                            {v.name}: {v.stock}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td><StockBadge stock={r.stock} /></td>
                  <td className="num font-semibold">{r.stock}</td>
                  <td className="num">{r.bought > 0 ? formatQ(r.avgCost) : "—"}</td>
                  <td className="num">{formatQ(Number(r.product.price))}</td>
                  <td className={`num ${r.unitProfit < 0 ? "text-red-600" : ""}`}>{r.bought > 0 ? formatQ(r.unitProfit) : "—"}</td>
                  <td className="num">{r.bought > 0 ? formatPct(r.unitMargin) : "—"}</td>
                  <td className="num">{formatQ(r.stockCost)}</td>
                  <td className="num">{formatQ(r.stockSaleValue)}</td>
                  <td className="num whitespace-nowrap">
                    <Link href={`/admin/bodega?reponer=${r.product.id}`} className="text-sm text-brand-pink-dark hover:underline">
                      + Reponer
                    </Link>
                    <DeleteProductButton
                      id={r.product.id}
                      name={r.product.name}
                      media={[
                        ...(r.product.images ?? []),
                        ...(r.product.video_url ? [r.product.video_url] : []),
                        ...(variantsOf.get(r.product.id) ?? []).flatMap((v) => v.images ?? []),
                      ]}
                      purchases={r.bought}
                      sales={r.sold}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
