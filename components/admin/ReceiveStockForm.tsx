"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PackagePlus } from "lucide-react";
import { receiveNewStock } from "@/app/admin/actions";
import type { Category } from "@/lib/categories";

export default function ReceiveStockForm({ today, categories }: { today: string; categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [qty, setQty] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ id: string; name: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const total = (Number(qty) || 0) * (Number(unitCost) || 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreated(null);
    setBusy(true);
    const res = await receiveNewStock({
      name,
      category,
      qty: Number(qty),
      unit_cost: Number(unitCost),
      supplier: supplier || null,
      purchased_at: date,
      notes: notes || null,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setCreated({ id: res.id ?? "", name: name.trim() });
    setName("");
    setCategory("");
    setQty("");
    setUnitCost("");
    setNotes("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-6">
      <h2 className="font-semibold text-brand-ink">Ingresar mercadería nueva</h2>
      <p className="mt-1 text-sm text-brand-ink/60">
        Anota lo que llegó y cuánto costó. El producto queda oculto en la tienda hasta que le pongas precio en Productos.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="r-name" className="adm-label">Nombre del producto</label>
          <input id="r-name" required className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="r-category" className="adm-label">Categoría</label>
          <select id="r-category" required className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Elige una categoría…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="r-qty" className="adm-label">Cantidad</label>
          <input id="r-qty" required type="number" min={1} step={1} inputMode="numeric" className="input-field" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div>
          <label htmlFor="r-cost" className="adm-label">Costo por unidad (Q)</label>
          <input id="r-cost" required type="number" min={0} step="0.01" inputMode="decimal" className="input-field" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
        </div>
        <div>
          <label htmlFor="r-supplier" className="adm-label">Proveedor (opcional)</label>
          <input id="r-supplier" className="input-field" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
        </div>
        <div>
          <label htmlFor="r-date" className="adm-label">Fecha</label>
          <input id="r-date" required type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="r-notes" className="adm-label">Notas (opcional)</label>
          <input id="r-notes" className="input-field" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy} className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 font-semibold">
          <PackagePlus size={18} />
          {busy ? "Guardando…" : "Ingresar a bodega"}
        </button>
        {total > 0 && <span className="text-sm text-brand-ink/60">Total invertido: <strong className="text-brand-ink">Q{total.toFixed(2)}</strong></span>}
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {created && (
        <p className="mt-3 text-sm text-emerald-600">
          «{created.name}» ya está en la bodega.{" "}
          <Link href={`/admin/productos/${created.id}`} className="font-semibold underline">
            Ponle precio, fotos y actívalo →
          </Link>
        </p>
      )}
    </form>
  );
}
