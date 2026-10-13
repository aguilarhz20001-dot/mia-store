import Link from "next/link";
import PageTitle from "@/components/admin/PageTitle";
import StatCard from "@/components/admin/StatCard";
import ErrorNote from "@/components/admin/ErrorNote";
import DeleteButton from "@/components/admin/DeleteButton";
import ExpenseForm from "@/components/admin/ExpenseForm";
import { deleteExpense } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";
import { loadRawData } from "@/lib/admin/data";
import { computeClosing } from "@/lib/admin/closing";
import { isValidDate, monthOf, periodName, prevMonth, quincenaOf } from "@/lib/admin/periods";
import { formatDate, formatQ, todayGT } from "@/lib/format";

export const dynamic = "force-dynamic";

const ALL = { start: "2000-01-01", end: "2099-12-31" };

export default async function GastosPage({ searchParams }: { searchParams: Promise<{ desde?: string; hasta?: string }> }) {
  const sp = await searchParams;
  const today = todayGT();

  // Por defecto se muestra el mes actual
  let start = isValidDate(sp.desde) ? sp.desde : monthOf(today).start;
  let end = isValidDate(sp.hasta) ? sp.hasta : monthOf(today).end;
  if (end < start) [start, end] = [end, start];
  const isAll = start === ALL.start && end === ALL.end;

  const supabase = await createClient();
  const raw = await loadRawData(supabase);

  const data = computeClosing(raw.products, raw.purchases, raw.sales, start, end, raw.expenses);
  const list = raw.expenses.filter((e) => e.spent_at >= start && e.spent_at <= end);
  const expenses = data.expenses!;
  const net = data.net!;

  const quick = [
    { label: "Esta quincena", ...quincenaOf(today) },
    { label: "Este mes", ...monthOf(today) },
    { label: "Mes anterior", ...prevMonth(today) },
    { label: "Todo", ...ALL },
  ];

  return (
    <>
      <PageTitle title="Gastos" description="Anota lo que gastas (bolsas, gasolina, stickers…) y mira si aun así queda ganancia." />
      {raw.error && <ErrorNote message={raw.error} />}

      {raw.expensesMissing ? (
        <ErrorNote message="Para usar Gastos falta crear la tabla: abre supabase/gastos.sql, pégalo en el SQL Editor de Supabase y dale Run. Luego recarga esta página." />
      ) : (
        <>
          <ExpenseForm today={today} />

          <section className="card mt-8 p-5 sm:p-6">
            <h2 className="font-semibold text-brand-ink">Período</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {quick.map((q) => (
                <Link key={q.label} href={`/admin/gastos?desde=${q.start}&hasta=${q.end}`} data-active={q.start === start && q.end === end} className="chip">
                  {q.label}
                </Link>
              ))}
            </div>
            {!isAll && (
              <form method="get" className="mt-4 flex flex-wrap items-end gap-4">
                <div>
                  <label htmlFor="g-from" className="adm-label">Desde</label>
                  <input id="g-from" name="desde" type="date" required defaultValue={start} className="input-field" />
                </div>
                <div>
                  <label htmlFor="g-to" className="adm-label">Hasta</label>
                  <input id="g-to" name="hasta" type="date" required defaultValue={end} className="input-field" />
                </div>
                <button type="submit" className="btn-outline px-6 py-2.5 font-semibold">Ver</button>
              </form>
            )}
            <p className="mt-4 text-sm text-brand-ink/60">
              Mostrando <strong className="text-brand-ink">{isAll ? "todo el historial" : periodName(start, end)}</strong>
              {!isAll && <> ({formatDate(start)} al {formatDate(end)})</>}.
            </p>
          </section>

          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="Ganancia de ventas" value={formatQ(data.sales.profit)} note="Ventas − costo de lo vendido" />
            <StatCard label="Gastos" value={formatQ(expenses.total)} note={`${expenses.count} gastos`} />
            <StatCard
              label="Ganancia después de gastos"
              value={formatQ(net)}
              note={net >= 0 ? "Sí quedó ganancia" : "Los gastos pasan a la ganancia"}
              tone={net > 0 ? "good" : net < 0 ? "bad" : "default"}
            />
          </div>

          {expenses.byCategory.length > 0 && (
            <section className="card mt-6 p-5">
              <h2 className="font-semibold text-brand-ink">Gastos por categoría</h2>
              <ul className="mt-3 divide-y divide-brand-pink/15 text-sm">
                {expenses.byCategory.map((c) => (
                  <li key={c.category} className="flex items-center justify-between py-2">
                    <span className="text-brand-ink">{c.category}</span>
                    <span className="tabular-nums text-brand-ink/70">{formatQ(c.total)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card mt-8 overflow-hidden">
            <div className="p-5 pb-3"><h2 className="font-semibold text-brand-ink">Historial de gastos</h2></div>
            <div className="overflow-x-auto">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Gasto</th>
                    <th>Categoría</th>
                    <th className="num">Monto</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {list.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-brand-ink/50">No hay gastos en este período.</td></tr>
                  )}
                  {list.map((e) => (
                    <tr key={e.id}>
                      <td className="whitespace-nowrap">{formatDate(e.spent_at)}</td>
                      <td className="font-medium text-brand-ink">
                        {e.description}
                        {e.notes && <div className="text-xs font-normal text-brand-ink/50">{e.notes}</div>}
                      </td>
                      <td>{e.category ?? "—"}</td>
                      <td className="num font-semibold">{formatQ(Number(e.amount))}</td>
                      <td className="num">
                        <DeleteButton action={deleteExpense} id={e.id} confirmText="¿Borrar este gasto?" />
                      </td>
                    </tr>
                  ))}
                </tbody>
                {list.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={3}>Total</td>
                      <td className="num">{formatQ(expenses.total)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}
