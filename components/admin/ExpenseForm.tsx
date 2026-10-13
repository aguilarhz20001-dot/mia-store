"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createExpense } from "@/app/admin/actions";
import { EXPENSE_CATEGORIES } from "@/lib/admin/types";

export default function ExpenseForm({ today }: { today: string }) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    setBusy(true);
    const res = await createExpense({
      description,
      category: category || null,
      amount: Number(amount),
      spent_at: date,
      notes: notes || null,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOk("Gasto registrado.");
    setDescription("");
    setAmount("");
    setNotes("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-6">
      <h2 className="font-semibold text-brand-ink">Registrar un gasto</h2>
      <p className="mt-1 text-sm text-brand-ink/60">Lo que gastas para vender y que no es mercadería: bolsas, gasolina, stickers, etc.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor="e-desc" className="adm-label">¿En qué se gastó?</label>
          <input id="e-desc" required placeholder="Ej. Bolsas, gasolina, stickers" className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label htmlFor="e-amount" className="adm-label">Monto (Q)</label>
          <input id="e-amount" required type="number" min={0.01} step="0.01" inputMode="decimal" className="input-field" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label htmlFor="e-date" className="adm-label">Fecha</label>
          <input id="e-date" required type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label htmlFor="e-cat" className="adm-label">Categoría (opcional)</label>
          <select id="e-cat" className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Sin categoría</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="e-notes" className="adm-label">Notas (opcional)</label>
          <input id="e-notes" className="input-field" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      <div className="mt-5">
        <button type="submit" disabled={busy} className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 font-semibold">
          <Plus size={18} />
          {busy ? "Guardando…" : "Guardar gasto"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {ok && <p className="mt-3 text-sm text-emerald-600">{ok}</p>}
    </form>
  );
}
