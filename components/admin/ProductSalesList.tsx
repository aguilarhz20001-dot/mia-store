import { ChevronRight } from "lucide-react";
import DeleteButton from "./DeleteButton";
import { deleteSale } from "@/app/admin/actions";
import type { ProductSalesGroup } from "@/lib/admin/salesByProduct";
import { formatDate, formatPct, formatQ } from "@/lib/format";

/**
 * Lista de productos con lo que se vendió de cada uno. Al tocar uno se abre su detalle:
 * ventas por estilo y cada venta. Se usa igual en Ventas y en el Cuadre.
 * `canDelete` solo en Ventas (en un cuadre guardado las ventas ya no se pueden borrar).
 */
export default function ProductSalesList({ groups, canDelete = false, emptyText }: { groups: ProductSalesGroup[]; canDelete?: boolean; emptyText: string }) {
  if (groups.length === 0) {
    return <p className="p-6 text-center text-sm text-brand-ink/50">{emptyText}</p>;
  }

  return (
    <ul className="divide-y divide-brand-pink/15">
      {groups.map((g) => (
        <li key={g.name}>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 hover:bg-brand-pink-light/40 sm:px-5 [&::-webkit-details-marker]:hidden">
              <ChevronRight size={18} className="shrink-0 text-brand-ink/40 transition-transform group-open:rotate-90" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-brand-ink">{g.name}</span>
                <span className="block text-sm text-brand-ink/60">
                  {g.units} {g.units === 1 ? "vendido" : "vendidos"}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block font-semibold tabular-nums text-brand-ink">{formatQ(g.revenue)}</span>
                <span className={`block text-xs tabular-nums ${g.profit < 0 ? "text-red-600" : "text-emerald-600"}`}>Gan. {formatQ(g.profit)}</span>
              </span>
            </summary>

            <div className="bg-brand-pink-light/20 px-4 pb-4 pt-1 sm:px-5">
              {g.styles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {g.styles.map((st) => (
                    <span key={st.name} className="rounded-full bg-white px-3 py-1 text-xs text-brand-ink/80 ring-1 ring-brand-pink/20">
                      {st.name}: <strong>{st.units}</strong> · {formatQ(st.revenue)}
                    </span>
                  ))}
                </div>
              )}

              <p className="mb-2 text-xs text-brand-ink/55">
                Costo {formatQ(g.cogs)} · Margen {formatPct(g.margin)}
              </p>

              <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-brand-pink/15">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      {g.styles.length > 0 && <th>Estilo</th>}
                      <th>Cliente</th>
                      <th className="num">Cant.</th>
                      <th className="num">Precio c/u</th>
                      <th className="num">Venta</th>
                      <th className="num">Ganancia</th>
                      {canDelete && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {g.lines.map((l, i) => (
                      <tr key={l.id ?? `${l.date}-${i}`}>
                        <td className="whitespace-nowrap">{formatDate(l.date)}</td>
                        {g.styles.length > 0 && <td>{l.style ?? "—"}</td>}
                        <td>
                          {l.customer ?? "—"}
                          {l.channel && <div className="text-xs text-brand-ink/50">{l.channel}</div>}
                          {l.notes && <div className="text-xs text-brand-ink/50">{l.notes}</div>}
                        </td>
                        <td className="num">{l.qty}</td>
                        <td className="num">{formatQ(l.unitPrice)}</td>
                        <td className="num">{formatQ(l.revenue)}</td>
                        <td className={`num font-semibold ${l.profit < 0 ? "text-red-600" : "text-emerald-600"}`}>{formatQ(l.profit)}</td>
                        {canDelete && (
                          <td className="num">
                            {l.id && <DeleteButton action={deleteSale} id={l.id} confirmText="¿Borrar esta venta? Las unidades volverán a la bodega." />}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
