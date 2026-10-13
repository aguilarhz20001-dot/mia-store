"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, ImagePlus, LoaderCircle, Pencil, Plus, Save, Star, Trash2, X } from "lucide-react";
import { adjustVariantStock, deleteVariant, moveVariantStock, saveVariant } from "@/app/admin/actions";
import type { VariantRow } from "@/lib/admin/types";
import { removeProductMedia, uploadProductMedia } from "@/lib/admin/upload";
import StockBadge from "./StockBadge";

/** Estilos de un producto (ej. la pijama con varios diseños): cada uno con sus fotos y su stock. */
export default function VariantManager({
  productId,
  productStock,
  variants,
}: {
  productId: string;
  /** Stock total actual del producto (para avisar qué pasa con las unidades que ya tenías) */
  productStock: number;
  variants: VariantRow[];
}) {
  return (
    <section className="mt-8">
      <h2 className="font-script text-3xl text-brand-ink">Estilos</h2>
      <p className="mt-1 text-sm text-brand-ink/65">
        Si este producto viene en varios diseños o colores (por ejemplo una pijama con distintos estampados), agrégalos aquí. El
        cliente elige uno o varios, ve la foto de cada estilo y cada uno lleva su propio stock.
      </p>

      <div className="mt-4 space-y-4">
        {variants.map((v) => (
          <VariantCard key={v.id} productId={productId} variant={v} others={variants.filter((x) => x.id !== v.id)} />
        ))}
        <VariantCard
          key={`nuevo-${variants.length}`}
          productId={productId}
          legacyStock={variants.length === 0 ? productStock : 0}
          sources={variants.filter((v) => v.stock > 0)}
          hasStyles={variants.length > 0}
        />
      </div>
    </section>
  );
}

function VariantCard({
  productId,
  variant,
  legacyStock = 0,
  sources = [],
  hasStyles = false,
  others = [],
}: {
  productId: string;
  variant?: VariantRow;
  legacyStock?: number;
  /** Estilos que ya tienen unidades: de ahí se pueden pasar al estilo nuevo */
  sources?: VariantRow[];
  hasStyles?: boolean;
  /** Los demás estilos del producto (para pasarles unidades) */
  others?: VariantRow[];
}) {
  const router = useRouter();
  const isNew = !variant;
  // Si ya hay unidades repartidas en otros estilos, el estilo nuevo toma de ahí (no se suma stock).
  const transferMode = isNew && sources.length > 0;
  // Si es el primer estilo y el producto ya tenía stock, pasa todo a este estilo (no hay nada que escribir).
  const inheritMode = isNew && !hasStyles && legacyStock > 0;
  // Solo se piden unidades nuevas (compra) cuando no hay stock existente que repartir.
  const buyMode = isNew && !transferMode && !inheritMode;
  const folder = `productos/${productId}/estilos`;

  const [name, setName] = useState(variant?.name ?? "");
  const [images, setImages] = useState<string[]>(variant?.images ?? []);
  const [active, setActive] = useState(variant?.active ?? true);
  const [initialQty, setInitialQty] = useState("");
  const [initialCost, setInitialCost] = useState("");
  const [takeFrom, setTakeFrom] = useState(sources[0]?.id ?? "");
  const [takeQty, setTakeQty] = useState("");
  const [showStock, setShowStock] = useState(false);
  const [adjQty, setAdjQty] = useState("");
  const [adjCost, setAdjCost] = useState("");
  const [moveTo, setMoveTo] = useState("");
  const [moveQty, setMoveQty] = useState("");
  const [removed, setRemoved] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function onPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setError("");
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) urls.push(await uploadProductMedia(file, folder));
      setImages((prev) => [...prev, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
    setRemoved((prev) => [...prev, url]);
  }

  function makeCover(url: string) {
    setImages((prev) => [url, ...prev.filter((u) => u !== url)]);
  }

  async function handleSave() {
    setError("");
    setOk("");
    if (!name.trim()) return setError("Escribe el nombre del estilo.");
    const qty = Number(initialQty);
    const cost = Number(initialCost);
    const take = Number(takeQty);
    const source = sources.find((v) => v.id === takeFrom);
    if (isNew && transferMode && takeQty) {
      if (!Number.isInteger(take) || take <= 0) return setError("La cantidad debe ser un número entero.");
      if (!source) return setError("Elige de cuál estilo salen las unidades.");
      if (take > source.stock) return setError(`Del estilo “${source.name}” solo puedes pasar hasta ${source.stock}.`);
    }
    if (isNew && buyMode && initialQty && (!Number.isInteger(qty) || qty <= 0)) return setError("La cantidad inicial debe ser un número entero.");
    if (isNew && buyMode && qty > 0 && (!initialCost || !Number.isFinite(cost) || cost < 0)) return setError("Escribe cuánto te costó cada unidad.");

    setSaving(true);
    const res = await saveVariant({
      id: variant?.id,
      product_id: productId,
      name,
      images,
      active,
      initial_qty: isNew && buyMode && qty > 0 ? qty : undefined,
      initial_cost: isNew && buyMode && qty > 0 ? cost : undefined,
      take_from: isNew && transferMode && take > 0 ? takeFrom : undefined,
      take_qty: isNew && transferMode && take > 0 ? take : undefined,
    });
    setSaving(false);
    if (!res.ok) return setError(res.error);

    if (removed.length > 0) {
      await removeProductMedia(removed);
      setRemoved([]);
    }
    setOk(isNew ? "Estilo agregado." : "Cambios guardados.");
    router.refresh();
  }

  async function handleAdjust() {
    if (!variant) return;
    setError("");
    setOk("");
    const target = Number(adjQty === "" ? variant.stock : adjQty);
    if (!Number.isInteger(target) || target < 0) return setError("La cantidad debe ser un número entero, 0 o más.");
    if (target === variant.stock) return setOk("Esa ya es la cantidad actual.");
    const cost = adjCost === "" ? undefined : Number(adjCost);
    if (cost !== undefined && (!Number.isFinite(cost) || cost < 0)) return setError("El costo debe ser un número válido.");
    if (target < variant.stock && !window.confirm(`El estilo “${variant.name}” pasará de ${variant.stock} a ${target} unidades. ¿Continuar?`)) return;

    setSaving(true);
    const res = await adjustVariantStock({ variant_id: variant.id, new_stock: target, unit_cost: target > variant.stock ? cost : undefined });
    setSaving(false);
    if (!res.ok) return setError(res.error);
    setAdjQty("");
    setAdjCost("");
    setOk("Cantidad corregida.");
    router.refresh();
  }

  async function handleMove() {
    if (!variant) return;
    setError("");
    setOk("");
    const to = moveTo || others[0]?.id || "";
    const qty = Number(moveQty);
    if (!to) return setError("Elige a cuál estilo pasar las unidades.");
    if (!Number.isInteger(qty) || qty <= 0) return setError("La cantidad debe ser un número entero mayor que cero.");
    if (qty > variant.stock) return setError(`Este estilo solo tiene ${variant.stock} en stock.`);

    setSaving(true);
    const res = await moveVariantStock({ from: variant.id, to, qty });
    setSaving(false);
    if (!res.ok) return setError(res.error);
    setMoveQty("");
    setOk("Unidades pasadas.");
    router.refresh();
  }

  async function handleDelete() {
    if (!variant) return;
    if (!window.confirm(`¿Borrar el estilo “${variant.name}”? Esta acción no se puede deshacer.`)) return;
    setSaving(true);
    const res = await deleteVariant(variant.id);
    setSaving(false);
    if (!res.ok) return setError(res.error);
    await removeProductMedia(images);
    router.refresh();
  }

  return (
    <div className={`card p-5 sm:p-6 ${isNew ? "border-dashed" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-brand-ink">{isNew ? "Agregar un estilo" : variant.name}</h3>
        {!isNew && (
          <div className="flex items-center gap-3 text-sm">
            <StockBadge stock={variant.stock} />
            <span className="text-brand-ink/60">{variant.stock} en stock</span>
            <Link href={`/admin/bodega?reponer=${productId}&estilo=${variant.id}`} className="text-brand-pink-dark hover:underline">
              + Reponer
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <div>
            <label className="adm-label">Nombre del estilo</label>
            <input className="input-field" placeholder="Ej. Gatitos, Corazones, Rosa…" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-brand-ink">
            <input type="checkbox" className="h-4 w-4 accent-[#e07fc3]" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Visible en la tienda
          </label>

          {inheritMode && (
            <div className="rounded-xl border border-brand-pink/25 bg-brand-pink-light/40 p-4">
              <p className="text-sm font-semibold text-brand-ink">Unidades de este estilo</p>
              <p className="mt-1 text-xs text-brand-ink/60">
                Las {legacyStock} {legacyStock === 1 ? "unidad" : "unidades"} que ya tenías de este producto pasarán a este primer estilo. Después, al agregar
                otro estilo, podrás pasarle las unidades que le correspondan.
              </p>
            </div>
          )}

          {transferMode && (
            <div className="rounded-xl border border-brand-pink/25 bg-brand-pink-light/40 p-4">
              <p className="text-sm font-semibold text-brand-ink">Unidades de este estilo (opcional)</p>
              <p className="mt-1 text-xs text-brand-ink/60">
                Salen del stock que ya tienes en bodega: el total del producto no cambia. Para unidades nuevas que compraste, usa «+ Reponer».
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="adm-label">Pasar desde</label>
                  <select className="input-field" value={takeFrom} onChange={(e) => setTakeFrom(e.target.value)}>
                    {sources.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="adm-label">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    max={sources.find((v) => v.id === takeFrom)?.stock}
                    step={1}
                    inputMode="numeric"
                    className="input-field"
                    value={takeQty}
                    onChange={(e) => setTakeQty(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {buyMode && (
            <div className="rounded-xl border border-brand-pink/25 bg-brand-pink-light/40 p-4">
              <p className="text-sm font-semibold text-brand-ink">Unidades de este estilo (opcional)</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="adm-label">Cantidad</label>
                  <input type="number" min={1} step={1} inputMode="numeric" className="input-field" value={initialQty} onChange={(e) => setInitialQty(e.target.value)} />
                </div>
                <div>
                  <label className="adm-label">Costo por unidad (Q)</label>
                  <input type="number" min={0} step="0.01" inputMode="decimal" className="input-field" value={initialCost} onChange={(e) => setInitialCost(e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="adm-label !mb-0">Fotos de este estilo</p>
            <button type="button" onClick={() => input.current?.click()} disabled={uploading} className="btn-outline inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold">
              {uploading ? <LoaderCircle size={16} className="animate-spin" /> : <ImagePlus size={16} />}
              Subir fotos
            </button>
          </div>
          <input ref={input} type="file" accept="image/*" multiple hidden onChange={onPhotos} />

          {images.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-brand-pink/40 p-5 text-center text-sm text-brand-ink/50">
              Sin fotos. La primera será la principal de este estilo.
            </p>
          ) : (
            <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((url, i) => (
                <li key={url} className="relative overflow-hidden rounded-xl bg-white ring-1 ring-brand-pink/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Foto ${i + 1}`} className="aspect-square w-full object-cover" />
                  {i === 0 ? (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-brand-pink-dark px-2 py-0.5 text-[10px] font-semibold text-white">Principal</span>
                  ) : (
                    <button type="button" onClick={() => makeCover(url)} title="Hacer principal" aria-label="Hacer principal" className="absolute left-1.5 top-1.5 rounded-full bg-white/90 p-1 text-brand-pink-dark shadow hover:bg-white">
                      <Star size={13} />
                    </button>
                  )}
                  <button type="button" onClick={() => removeImage(url)} title="Quitar foto" aria-label="Quitar foto" className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-red-600 shadow hover:bg-white">
                    <X size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {!isNew && variant && (
        <div className="mt-5 border-t border-brand-pink/15 pt-4">
          <button
            type="button"
            onClick={() => setShowStock((v) => !v)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-pink-dark hover:underline"
          >
            <Pencil size={15} /> {showStock ? "Ocultar" : "Corregir cantidad o pasar unidades"}
          </button>

          {showStock && (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-brand-pink/25 bg-brand-pink-light/40 p-4">
                <p className="text-sm font-semibold text-brand-ink">Corregir cantidad</p>
                <p className="mt-1 text-xs text-brand-ink/60">Escribe cuántas unidades hay realmente. Las ventas ya hechas no se tocan.</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="adm-label">Cantidad correcta</label>
                    <input type="number" min={0} step={1} inputMode="numeric" className="input-field" value={adjQty === "" ? String(variant.stock) : adjQty} onChange={(e) => setAdjQty(e.target.value)} />
                  </div>
                  {Number(adjQty === "" ? variant.stock : adjQty) > variant.stock && (
                    <div>
                      <label className="adm-label">Costo por unidad (Q)</label>
                      <input type="number" min={0} step="0.01" inputMode="decimal" className="input-field" placeholder="Opcional" value={adjCost} onChange={(e) => setAdjCost(e.target.value)} />
                    </div>
                  )}
                </div>
                {Number(adjQty === "" ? variant.stock : adjQty) > variant.stock && (
                  <p className="mt-2 text-xs text-brand-ink/60">Si dejas el costo vacío se usa el costo promedio de este estilo.</p>
                )}
                <button type="button" onClick={handleAdjust} disabled={saving || uploading} className="btn-primary mt-3 inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold">
                  <Save size={16} /> Guardar cantidad
                </button>
              </div>

              {others.length > 0 && (
                <div className="rounded-xl border border-brand-pink/25 bg-brand-pink-light/40 p-4">
                  <p className="text-sm font-semibold text-brand-ink">Pasar unidades a otro estilo</p>
                  <p className="mt-1 text-xs text-brand-ink/60">Salen de “{variant.name}” y entran al otro. El total del producto no cambia.</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="adm-label">Pasar a</label>
                      <select className="input-field" value={moveTo || others[0]?.id} onChange={(e) => setMoveTo(e.target.value)}>
                        {others.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name} ({o.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="adm-label">Cantidad</label>
                      <input type="number" min={1} max={variant.stock} step={1} inputMode="numeric" className="input-field" value={moveQty} onChange={(e) => setMoveQty(e.target.value)} />
                    </div>
                  </div>
                  <button type="button" onClick={handleMove} disabled={saving || uploading || variant.stock === 0} className="btn-outline mt-3 inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold">
                    <ArrowRightLeft size={16} /> Pasar unidades
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {ok && <p className="mt-4 text-sm text-emerald-600">{ok}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleSave} disabled={saving || uploading} className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 font-semibold">
          {saving ? <LoaderCircle size={18} className="animate-spin" /> : isNew ? <Plus size={18} /> : <Save size={18} />}
          {saving ? "Guardando…" : isNew ? "Agregar estilo" : "Guardar estilo"}
        </button>
        {!isNew && (
          <button type="button" onClick={handleDelete} disabled={saving} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
            <Trash2 size={16} /> Borrar
          </button>
        )}
      </div>
    </div>
  );
}
