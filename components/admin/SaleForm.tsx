"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createSale } from "@/app/admin/actions";
import { SALE_CHANNELS } from "@/lib/admin/types";

export type SaleOption = {
  id: string;
  name: string;
  stock: number;
  price: number;
  avgCost: number;
  /** Estilos del producto con su propio stock (si tiene) */
  variants: { id: string; name: string; stock: number }[];
};

export default function SaleForm({ options, today }: { options: SaleOption[]; today: string }) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [qty, setQty] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [customer, setCustomer] = useState("");
  const [channel, setChannel] = useState("WhatsApp");
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  const selected = options.find((o) => o.id === productId);
  const hasVariants = (selected?.variants.length ?? 0) > 0;
  const selectedVariant = selected?.variants.find((v) => v.id === variantId);
  const maxQty = hasVariants ? selectedVariant?.stock : selected?.stock;
  const q = Number(qty) || 0;
  const price = Number(unitPrice) || 0;
  const revenue = q * price;
  const profit = selected ? q * (price - selected.avgCost) : 0;

  function pickProduct(id: string) {
    setProductId(id);
    setVariantId("");
    const opt = options.find((o) => o.id === id);
    if (opt) setUnitPrice(String(opt.price));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    setBusy(true);
    const res = await createSale({
      product_id: productId,
      variant_id: hasVariants ? variantId : null,
      qty: Number(qty),
      unit_price: Number(unitPrice),
      customer: customer || null,
      channel,
      sold_at: date,
      notes: notes || null,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOk("Venta registrada. El stock ya se actualizó.");
    setQty("1");
    setCustomer("");
    setNotes("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-6">
      <h2 className="font-semibold text-brand-ink">Registrar venta</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor="s-product" className="adm-label">Producto</label>
          <select id="s-product" required className="input-field" value={productId} onChange={(e) => pickProduct(e.target.value)}>
            <option value="">Elige un producto…</option>
            {options.map((o) => (
              <option key={o.id} value={o.id} disabled={o.stock <= 0}>
                {o.name} — {o.stock > 0 ? `${o.stock} en stock` : "agotado"}
              </option>
            ))}
          </select>
        </div>
        {hasVariants && (
          <div className="sm:col-span-2">
            <label htmlFor="s-variant" className="adm-label">Estilo</label>
            <select id="s-variant" required className="input-field" value={variantId} onChange={(e) => setVariantId(e.target.value)}>
              <option value="">Elige un estilo…</option>
              {selected!.variants.map((v) => (
                <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                  {v.name} — {v.stock > 0 ? `${v.stock} en stock` : "agotado"}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="s-qty" className="adm-label">Cantidad</label>
          <input id="s-qty" required type="number" min={1} max={maxQty} step={1} inputMode="numeric" className="input-field" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div>
          <label htmlFor="s-price" className="adm-label">Precio por unidad (Q)</label>
          <input id="s-price" required type="number" min={0} step="0.01" inputMode="decimal" className="input-field" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
        </div>
        <div>
          <label htmlFor="s-customer" className="adm-label">Cliente (opcional)</label>
          <input id="s-customer" className="input-field" value={customer} onChange={(e) => setCustomer(e.target.value)} />
        </div>
        <div>
          <label htmlFor="s-channel" className="adm-label">¿Por dónde compró?</label>
          <select id="s-channel" className="input-field" value={channel} onChange={(e) => setChannel(e.target.value)}>
            {SALE_CHANNELS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="s-date" className="adm-label">Fecha</label>
          <input id="s-date" required type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label htmlFor="s-notes" className="adm-label">Notas (opcional)</label>
          <input id="s-notes" className="input-field" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={busy} className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 font-semibold">
          <Plus size={18} />
          {busy ? "Guardando…" : "Guardar venta"}
        </button>
        {revenue > 0 && (
          <span className="text-sm text-brand-ink/60">
            Total: <strong className="text-brand-ink">Q{revenue.toFixed(2)}</strong>
            {selected && selected.avgCost > 0 && (
              <> · Ganancia aprox.: <strong className={profit < 0 ? "text-red-600" : "text-emerald-600"}>Q{profit.toFixed(2)}</strong></>
            )}
          </span>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {ok && <p className="mt-3 text-sm text-emerald-600">{ok}</p>}
    </form>
  );
}
