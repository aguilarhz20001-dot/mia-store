"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createPurchase } from "@/app/admin/actions";

export type PurchaseOption = {
  id: string;
  name: string;
  lastCost: number | null;
  /** Estilos del producto (si tiene) */
  variants: { id: string; name: string }[];
};

export default function PurchaseForm({
  options,
  today,
  initialProductId,
  initialVariantId,
}: {
  options: PurchaseOption[];
  today: string;
  initialProductId?: string;
  initialVariantId?: string;
}) {
  const router = useRouter();
  const first = options.find((o) => o.id === initialProductId);
  const [productId, setProductId] = useState(first?.id ?? "");
  const [variantId, setVariantId] = useState(first?.variants.some((v) => v.id === initialVariantId) ? (initialVariantId ?? "") : "");
  const [qty, setQty] = useState("");
  const [unitCost, setUnitCost] = useState(first?.lastCost != null ? String(first.lastCost) : "");
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  const total = (Number(qty) || 0) * (Number(unitCost) || 0);
  const selected = options.find((o) => o.id === productId);
  const hasVariants = (selected?.variants.length ?? 0) > 0;

  function pickProduct(id: string) {
    setProductId(id);
    setVariantId("");
    const opt = options.find((o) => o.id === id);
    if (opt?.lastCost != null) setUnitCost(String(opt.lastCost));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    setBusy(true);
    const res = await createPurchase({
      product_id: productId,
      variant_id: hasVariants ? variantId : null,
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
    setOk("Compra registrada. El stock ya se actualizó.");
    setQty("");
    setNotes("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-6">
      <h2 className="font-semibold text-brand-ink">Reponer un producto que ya tienes</h2>
      <p className="mt-1 text-sm text-brand-ink/60">Suma unidades a la bodega y guarda lo que costó esta vez.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor="p-product" className="adm-label">Producto</label>
          <select id="p-product" required className="input-field" value={productId} onChange={(e) => pickProduct(e.target.value)}>
            <option value="">Elige un producto…</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
        {hasVariants && (
          <div className="sm:col-span-2">
            <label htmlFor="p-variant" className="adm-label">Estilo</label>
            <select id="p-variant" required className="input-field" value={variantId} onChange={(e) => setVariantId(e.target.value)}>
              <option value="">Elige un estilo…</option>
              {selected!.variants.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="p-qty" className="adm-label">Cantidad</label>
          <input id="p-qty" required type="number" min={1} step={1} inputMode="numeric" className="input-field" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div>
          <label htmlFor="p-cost" className="adm-label">Costo por unidad (Q)</label>
          <input id="p-cost" required type="number" min={0} step="0.01" inputMode="decimal" className="input-field" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
        </div>
        <div>
          <label htmlFor="p-supplier" className="adm-label">Proveedor (opcional)</label>
          <input id="p-supplier" className="input-field" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
        </div>
        <div>
          <label htmlFor="p-date" className="adm-label">Fecha</label>
          <input id="p-date" required type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="p-notes" className="adm-label">Notas (opcional)</label>
          <input id="p-notes" className="input-field" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy} className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 font-semibold">
          <Plus size={18} />
          {busy ? "Guardando…" : "Guardar compra"}
        </button>
        {total > 0 && <span className="text-sm text-brand-ink/60">Total de la compra: <strong className="text-brand-ink">Q{total.toFixed(2)}</strong></span>}
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {ok && <p className="mt-3 text-sm text-emerald-600">{ok}</p>}
    </form>
  );
}
