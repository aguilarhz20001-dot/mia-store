import Link from "next/link";
import PageTitle from "@/components/admin/PageTitle";
import ErrorNote from "@/components/admin/ErrorNote";
import ClosingSummary from "@/components/admin/ClosingSummary";
import CloseForm from "@/components/admin/CloseForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteClosing } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";
import { loadRawData } from "@/lib/admin/data";
import { computeClosing, type ClosingSnapshot } from "@/lib/admin/closing";
import { isValidDate, monthOf, periodName, prevMonth, prevQuincena, quincenaOf } from "@/lib/admin/periods";
import { formatDate, formatQ, todayGT } from "@/lib/format";

export const dynamic = "force-dynamic";

type ClosingRow = {
  id: string;
  name: string;
  period_start: string;
  period_end: string;
  created_at: string;
  snapshot: ClosingSnapshot;
};

export default async function CuadrePage({ searchParams }: { searchParams: Promise<{ desde?: string; hasta?: string }> }) {
  const sp = await searchParams;
  const today = todayGT();

  let start = isValidDate(sp.desde) ? sp.desde : quincenaOf(today).start;
  let end = isValidDate(sp.hasta) ? sp.hasta : quincenaOf(today).end;
  if (end < start) [start, end] = [end, start];

  const supabase = await createClient();
  const [raw, closingsRes] = await Promise.all([
    loadRawData(supabase),
    supabase.from("closings").select("id, name, period_start, period_end, created_at, snapshot").order("period_start", { ascending: false }).order("created_at", { ascending: false }),
  ]);

  const missingTable = closingsRes.error?.code === "PGRST205" || closingsRes.error?.code === "42P01";
  const closings = (closingsRes.data ?? []) as ClosingRow[];
  const overlaps = closings.filter((c) => c.period_start <= end && c.period_end >= start);

  const data = computeClosing(raw.products, raw.purchases, raw.sales, start, end, raw.expenses);

  const quick = [
    { label: "Esta quincena", ...quincenaOf(today) },
    { label: "Quincena anterior", ...prevQuincena(today) },
    { label: "Este mes", ...monthOf(today) },
    { label: "Mes anterior", ...prevMonth(today) },
  ];

  return (
    <>
      <PageTitle title="Cuadre" description="Mira los números de un período y guárdalos para no confundirte con los antiguos." />
      {raw.error && <ErrorNote message={raw.error} />}

      <section className="card p-5 sm:p-6">
        <h2 className="font-semibold text-brand-ink">Período</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {quick.map((q) => (
            <Link key={q.label} href={`/admin/cuadre?desde=${q.start}&hasta=${q.end}`} data-active={q.start === start && q.end === end} className="chip">
              {q.label}
            </Link>
          ))}
        </div>
        <form method="get" className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="q-from" className="adm-label">Desde</label>
            <input id="q-from" name="desde" type="date" required defaultValue={start} className="input-field" />
          </div>
          <div>
            <label htmlFor="q-to" className="adm-label">Hasta</label>
            <input id="q-to" name="hasta" type="date" required defaultValue={end} className="input-field" />
          </div>
          <button type="submit" className="btn-outline px-6 py-2.5 font-semibold">Ver</button>
        </form>
        <p className="mt-4 text-sm text-brand-ink/60">
          Mostrando <strong className="text-brand-ink">{periodName(start, end)}</strong> ({formatDate(start)} al {formatDate(end)}).
        </p>
      </section>

      <div className="mt-6">
        <ClosingSummary data={data} />
      </div>

      <div className="mt-8">
        {missingTable ? (
          <ErrorNote message="Para guardar cuadres falta crear la tabla: abre supabase/cuadres.sql, pégalo en el SQL Editor de Supabase y dale Run. Luego recarga esta página." />
        ) : (
          <>
            {closingsRes.error && <ErrorNote message={closingsRes.error.message} />}
            {overlaps.length > 0 && (
              <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Ojo: ya guardaste {overlaps.length === 1 ? "un cuadre" : "cuadres"} que cubre{overlaps.length === 1 ? "" : "n"} estas fechas:{" "}
                {overlaps.map((c) => `${c.name} (${formatDate(c.period_start)} al ${formatDate(c.period_end)})`).join(", ")}. Revisa que no lo estés duplicando.
              </p>
            )}
            <CloseForm key={`${start}_${end}`} defaultName={periodName(start, end)} start={start} end={end} />
          </>
        )}
      </div>

      {!missingTable && (
        <section className="card mt-8 overflow-hidden">
          <div className="p-5 pb-3"><h2 className="font-semibold text-brand-ink">Cuadres guardados</h2></div>
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Cuadre</th>
                  <th>Período</th>
                  <th className="num">Vendido</th>
                  <th className="num">Ganancia</th>
                  <th className="num">Invertido</th>
                  <th>Guardado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {closings.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-brand-ink/50">Todavía no has guardado ningún cuadre.</td></tr>
                )}
                {closings.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/admin/cuadre/${c.id}`} className="font-medium text-brand-ink hover:text-brand-pink-dark">{c.name}</Link>
                    </td>
                    <td className="whitespace-nowrap">{formatDate(c.period_start)} – {formatDate(c.period_end)}</td>
                    <td className="num">{formatQ(c.snapshot.sales.revenue)}</td>
                    <td className={`num ${c.snapshot.sales.profit < 0 ? "text-red-600" : ""}`}>{formatQ(c.snapshot.sales.profit)}</td>
                    <td className="num">{formatQ(c.snapshot.purchases.invested)}</td>
                    <td className="whitespace-nowrap">{formatDate(c.created_at)}</td>
                    <td className="num">
                      <DeleteButton action={deleteClosing} id={c.id} confirmText={`¿Borrar el cuadre «${c.name}»? Esta acción no se puede deshacer.`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
