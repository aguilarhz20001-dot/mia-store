"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X } from "lucide-react";
import { setStock } from "@/app/admin/actions";

/** Número de stock que se puede corregir al instante (solo hacia abajo). */
export default function StockEditor({
  productId,
  variantId,
  stock,
  label,
}: {
  productId: string;
  variantId: string | null;
  stock: number;
  /** Si se pasa, se muestra como etiqueta pequeña de estilo («mikey: 3») */
  label?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(stock));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function open() {
    setValue(String(stock));
    setError("");
    setEditing(true);
  }

  async function save() {
    setBusy(true);
    setError("");
    const res = await setStock({ product_id: productId, variant_id: variantId, target: Number(value) });
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={open}
        title="Corregir stock"
        className={
          label
            ? `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${stock <= 0 ? "bg-red-100 text-red-700" : "bg-brand-lilac-light text-brand-lilac-dark"}`
            : "inline-flex items-center gap-1 font-semibold hover:text-brand-pink-dark"
        }
      >
        {label ? `${label}: ${stock}` : stock}
        <Pencil size={label ? 10 : 12} className="opacity-50" />
      </button>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <span className="inline-flex items-center gap-1">
        {label && <span className="text-xs text-brand-ink/60">{label}:</span>}
        <input
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
          aria-label="Stock real"
          className="w-16 rounded-lg border border-brand-pink/40 px-2 py-1 text-right text-sm"
        />
        <button type="button" onClick={save} disabled={busy} aria-label="Guardar" className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40">
          <Check size={16} />
        </button>
        <button type="button" onClick={() => setEditing(false)} aria-label="Cancelar" className="rounded-lg p-1 text-brand-ink/50 hover:bg-brand-pink-light">
          <X size={16} />
        </button>
      </span>
      {error && <span className="max-w-[16rem] text-right text-xs text-red-600">{error}</span>}
    </span>
  );
}
