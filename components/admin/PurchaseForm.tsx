"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createPurchase } from "@/app/admin/actions";
import type { PaidFrom } from "@/lib/admin/types";
import PaidFromSelect from "./PaidFromSelect";
import ThumbSelect from "./ThumbSelect";

export type PurchaseOption = {
  id: string;
  name: string;
  lastCost: number | null;
  /** Foto principal (para la miniatura) */
  image: string | null;
  /** Estilos del producto (si tiene) */
  variants: { id: string; name: string; image: string | null }[];
};

const NEW_STYLE = "__nuevo__";

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
  const [newStyle, setNewStyle] = useState("");
  const [qty, setQty] = useState("");
  const [unitCost, setUnitCost] = useState(first?.lastCost != null ? String(first.lastCost) : "");
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [paidFrom, setPaidFrom] = useState<PaidFrom>("caja");
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
    if (!productId) return setError("Elige un producto.");
    if (hasVariants && !variantId) return setError("Elige un estilo.");
    setBusy(true);
    const res = await createPurchase({
      product_id: productId,
      variant_id: hasVariants && variantId !== NEW_STYLE ? variantId : null,
      new_variant_name: hasVariants && variantId === NEW_STYLE ? newStyle : null,
      qty: Number(qty),
      unit_cost: Number(unitCost),
      supplier: supplier || null,
      purchased_at: date,
      notes: notes || null,
      paid_from: paidFrom,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOk(variantId === NEW_STYLE ? `Estilo «${newStyle.trim()}» creado y compra registrada. Ya puedes ponerle fotos en Productos.` : "Compra registrada. El stock ya se actualizó.");
    setVariantId("");
    setNewStyle("");
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
          <ThumbSelect
            id="p-product"
            value={productId}
            onChange={pickProduct}
            placeholder="Elige un producto…"
            items={options.map((o) => ({ value: o.id, label: o.name, image: o.image }))}
          />
        </div>
        {hasVariants && (
          <div className="sm:col-span-2">
            <label htmlFor="p-variant" className="adm-label">Estilo</label>
            <ThumbSelect
              id="p-variant"
              value={variantId}
              onChange={setVariantId}
              placeholder="Elige un estilo…"
              items={[
                ...selected!.variants.map((v) => ({ value: v.id, label: v.name, image: v.image })),
                { value: NEW_STYLE, label: "Nuevo estilo…", plain: true },
              ]}
            />
            {variantId === NEW_STYLE && (
              <input
                required
                autoFocus
                aria-label="Nombre del estilo nuevo"
                placeholder="Nombre del estilo nuevo (ej. Corazones)"
                className="input-field mt-2"
                value={newStyle}
                onChange={(e) => setNewStyle(e.target.value)}
              />
            )}
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
        <PaidFromSelect id="p-paid" value={paidFrom} onChange={setPaidFrom} />
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
