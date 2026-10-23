import PageTitle from "@/components/admin/PageTitle";
import StatCard from "@/components/admin/StatCard";
import ErrorNote from "@/components/admin/ErrorNote";
import DeleteButton from "@/components/admin/DeleteButton";
import { CashMovementForm, CountCashForm } from "@/components/admin/CashForms";
import { deleteCashMovement } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";
import { loadRawData } from "@/lib/admin/data";
import { computeCash } from "@/lib/admin/cash";
import { formatDate, formatQ, todayGT } from "@/lib/format";

export const dynamic = "force-dynamic";

type Entry = { key: string; date: string; created: string; label: string; detail: string; amount: number; movementId?: string };

export default async function CajaPage() {
  const today = todayGT();
  const supabase = await createClient();
  const raw = await loadRawData(supabase);
  const cash = computeCash(raw.purchases, raw.sales, raw.expenses, raw.cashMovements);

  const names = new Map(raw.products.map((p) => [p.id, p.name]));
  const entries: Entry[] = [
    ...raw.sales.map((s) => ({
      key: `s${s.id}`, date: s.sold_at, created: s.created_at,
      label: "Venta", detail: `${names.get(s.product_id) ?? "Producto"} × ${s.qty}`, amount: s.qty * Number(s.unit_price),
    })),
    ...raw.purchases.filter((p) => p.paid_from === "caja").map((p) => ({
      key: `p${p.id}`, date: p.purchased_at, created: p.created_at,
      label: "Compra de mercadería", detail: `${names.get(p.product_id) ?? "Producto"} × ${p.qty}`, amount: -(p.qty * Number(p.unit_cost)),
    })),
    ...raw.expenses.filter((e) => e.paid_from === "caja").map((e) => ({
      key: `e${e.id}`, date: e.spent_at, created: e.created_at,
      label: "Gasto", detail: e.description, amount: -Number(e.amount),
    })),
    ...raw.cashMovements.map((m) => ({
      key: `m${m.id}`, date: m.moved_at, created: m.created_at,
      label: m.kind === "deposito" ? "Dinero que entró" : "Dinero que salió", detail: m.concept,
      amount: m.kind === "deposito" ? Number(m.amount) : -Number(m.amount), movementId: m.id,
    })),
  ]
    .sort((a, b) => (a.date === b.date ? b.created.localeCompare(a.created) : b.date.localeCompare(a.date)))
    .slice(0, 50);

  return (
    <>
      <PageTitle title="Caja" description="El dinero que tienen para surtir y pagar gastos. Las ventas lo suben; las compras y gastos pagados con la caja lo bajan." />
      {raw.error && <ErrorNote message={raw.error} />}

      {raw.cashMissing ? (
        <ErrorNote message="Para usar la Caja falta crear la tabla: abre supabase/caja.sql, pégalo en el SQL Editor de Supabase y dale Run. Luego recarga esta página." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Dinero en caja" value={formatQ(cash.balance)} note="Lo que debería haber ahora" tone={cash.balance < 0 ? "bad" : "good"} />
            <StatCard label="Entró por ventas" value={formatQ(cash.salesIn)} />
            <StatCard label="Salió en mercadería" value={formatQ(cash.purchasesOut)} note="Compras pagadas con la caja" />
            <StatCard label="Salió en gastos" value={formatQ(cash.expensesOut)} note="Bolsas, gasolina, etc." />
          </div>
          {(cash.deposits > 0 || cash.withdrawals > 0) && (
            <p className="mt-3 text-sm text-brand-ink/60">
              Dinero metido a mano: {formatQ(cash.deposits)} · Dinero sacado a mano: {formatQ(cash.withdrawals)}
            </p>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <CashMovementForm today={today} />
            <CountCashForm today={today} balance={cash.balance} />
          </div>

          <section className="card mt-8 overflow-hidden">
            <div className="p-5 pb-3">
              <h2 className="font-semibold text-brand-ink">Últimos movimientos de la caja</h2>
              <p className="mt-1 text-sm text-brand-ink/60">Las compras y gastos pagados con dinero personal no aparecen aquí.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="adm-table">
                <thead>
                  <tr><th>Fecha</th><th>Movimiento</th><th>Detalle</th><th className="num">Monto</th><th></th></tr>
                </thead>
                <tbody>
                  {entries.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-brand-ink/50">Todavía no hay movimientos.</td></tr>
                  )}
                  {entries.map((e) => (
                    <tr key={e.key}>
                      <td className="whitespace-nowrap">{formatDate(e.date)}</td>
                      <td className="font-medium text-brand-ink">{e.label}</td>
                      <td>{e.detail}</td>
                      <td className={`num font-semibold ${e.amount < 0 ? "text-red-600" : "text-emerald-600"}`}>
                        {e.amount < 0 ? "−" : "+"}{formatQ(Math.abs(e.amount))}
                      </td>
                      <td className="num">
                        {e.movementId && <DeleteButton action={deleteCashMovement} id={e.movementId} confirmText="¿Borrar este movimiento de la caja?" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}
