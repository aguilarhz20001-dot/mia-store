"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCashMovement, countCash } from "@/app/admin/actions";
import { formatQ } from "@/lib/format";

/** Meter o sacar dinero de la caja. */
export function CashMovementForm({ today }: { today: string }) {
  const router = useRouter();
  const [kind, setKind] = useState<"deposito" | "retiro">("deposito");
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [date, setDate] = useState(today);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    setBusy(true);
    const res = await createCashMovement({ kind, amount: Number(amount), concept, moved_at: date });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setOk(kind === "deposito" ? "Dinero agregado a la caja." : "Dinero retirado de la caja.");
    setAmount("");
    setConcept("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-6">
      <h2 className="font-semibold text-brand-ink">Meter o sacar dinero</h2>
      <p className="mt-1 text-sm text-brand-ink/60">Ej. el dinero con el que empezaron, lo que ponen de su bolsillo o lo que retiran de ganancia.</p>
      <div className="mt-3 flex gap-2">
        <button type="button" className="chip" data-active={kind === "deposito"} onClick={() => setKind("deposito")}>Meter dinero</button>
        <button type="button" className="chip" data-active={kind === "retiro"} onClick={() => setKind("retiro")}>Sacar dinero</button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-amount" className="adm-label">Monto (Q)</label>
          <input id="c-amount" required type="number" min={0.01} step="0.01" inputMode="decimal" className="input-field" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label htmlFor="c-date" className="adm-label">Fecha</label>
          <input id="c-date" required type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="c-concept" className="adm-label">Motivo</label>
          <input id="c-concept" required className="input-field" placeholder={kind === "deposito" ? "Ej. Dinero inicial" : "Ej. Retiro de ganancia"} value={concept} onChange={(e) => setConcept(e.target.value)} />
        </div>
      </div>
      <button type="submit" disabled={busy} className="btn-primary mt-5 px-6 py-2.5 font-semibold">
        {busy ? "Guardando…" : kind === "deposito" ? "Meter a la caja" : "Sacar de la caja"}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {ok && <p className="mt-3 text-sm text-emerald-600">{ok}</p>}
    </form>
  );
}

/** Contar la caja: se escribe lo que hay de verdad y se ajusta la diferencia. */
export function CountCashForm({ today, balance }: { today: string; balance: number }) {
  const router = useRouter();
  const [real, setReal] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  const diff = real === "" ? null : Math.round((Number(real) - balance) * 100) / 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    setBusy(true);
    const res = await countCash({ real: Number(real), today });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setOk("Caja ajustada: ahora coincide con lo que contaste.");
    setReal("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-6">
      <h2 className="font-semibold text-brand-ink">Contar la caja</h2>
      <p className="mt-1 text-sm text-brand-ink/60">
        Cuenta el dinero que hay de verdad y escríbelo. Si no coincide con el sistema, se registra la diferencia como ajuste.
      </p>
      <div className="mt-4 max-w-xs">
        <label htmlFor="k-real" className="adm-label">Dinero que hay en la caja (Q)</label>
        <input id="k-real" required type="number" min={0} step="0.01" inputMode="decimal" className="input-field" value={real} onChange={(e) => setReal(e.target.value)} />
      </div>
      {diff !== null && Number.isFinite(diff) && (
        <p className="mt-3 text-sm text-brand-ink/70">
          {diff === 0
            ? "Coincide con el sistema, no hay nada que ajustar."
            : diff > 0
              ? `Al sistema le faltan ${formatQ(diff)}: se agregarán como ajuste.`
              : `Al sistema le sobran ${formatQ(Math.abs(diff))}: se descontarán como ajuste.`}
        </p>
      )}
      <button type="submit" disabled={busy} className="btn-outline mt-5 px-6 py-2.5 font-semibold">
        {busy ? "Guardando…" : "Ajustar caja"}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {ok && <p className="mt-3 text-sm text-emerald-600">{ok}</p>}
    </form>
  );
}
