import Link from "next/link";
import { PackagePlus } from "lucide-react";
import PageTitle from "@/components/admin/PageTitle";
import StatCard from "@/components/admin/StatCard";
import ErrorNote from "@/components/admin/ErrorNote";
import DeleteButton from "@/components/admin/DeleteButton";
import { deletePurchase } from "@/app/admin/actions";
import { loadAdminData } from "@/lib/admin/data";
import { formatDate, formatQ } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ComprasPage() {
  const { error, products, purchases, variants, rows, totals } = await loadAdminData();
  const variantName = new Map(variants.map((v) => [v.id, v.name]));

  const nameOf = new Map(products.map((p) => [p.id, p.name]));
  const potential = rows.reduce((n, r) => n + r.stockSaleValue, 0);

  return (
    <>
      <PageTitle
        title="Compras"
        description="El historial de todo lo que has comprado y lo que costó. Las compras nuevas se registran en Bodega."
        action={
          <Link href="/admin/bodega" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 font-semibold">
            <PackagePlus size={18} /> Ingresar en Bodega
          </Link>
        }
      />
      {error && <ErrorNote message={error} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Total invertido" value={formatQ(totals.invested)} note={`${totals.bought} unidades compradas`} />
        <StatCard label="Venta potencial de todo lo comprado" value={formatQ(totals.revenue + potential)} note="Lo ya vendido + lo que hay en bodega a precio actual" />
        <StatCard label="Compras registradas" value={String(purchases.length)} />
      </div>

      <section className="card mt-8 overflow-hidden">
        <div className="p-5 pb-3"><h2 className="font-semibold text-brand-ink">Historial de compras</h2></div>
        <div className="overflow-x-auto">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Proveedor</th>
                <th className="num">Cantidad</th>
                <th className="num">Costo c/u</th>
                <th className="num">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-brand-ink/50">Todavía no hay compras.</td></tr>
              )}
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td className="whitespace-nowrap">{formatDate(p.purchased_at)}</td>
                  <td className="font-medium text-brand-ink">
                    {nameOf.get(p.product_id) ?? "Producto"}
                    {p.variant_id && variantName.get(p.variant_id) && (
                      <span className="font-normal text-brand-ink/60"> · {variantName.get(p.variant_id)}</span>
                    )}
                    {p.notes && <div className="text-xs font-normal text-brand-ink/50">{p.notes}</div>}
                  </td>
                  <td>{p.supplier ?? "—"}</td>
                  <td className="num">{p.qty}</td>
                  <td className="num">{formatQ(Number(p.unit_cost))}</td>
                  <td className="num font-semibold">{formatQ(p.qty * Number(p.unit_cost))}</td>
                  <td className="num">
                    <DeleteButton action={deletePurchase} id={p.id} confirmText="¿Borrar esta compra? El stock de ese producto bajará." />
                  </td>
                </tr>
              ))}
            </tbody>
            {purchases.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={3}>Total</td>
                  <td className="num">{totals.bought}</td>
                  <td></td>
                  <td className="num">{formatQ(totals.invested)}</td>
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
