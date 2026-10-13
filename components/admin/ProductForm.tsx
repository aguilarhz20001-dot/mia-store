"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Video, X, Star, Save, Trash2, LoaderCircle } from "lucide-react";
import { saveProduct, saveVariant, deleteProductFully, createPurchase } from "@/app/admin/actions";
import type { Category } from "@/lib/categories";
import { slugify, todayGT } from "@/lib/format";
import type { ProductRow } from "@/lib/products";
import { MAX_VIDEO_MB, removeProductMedia, uploadProductMedia } from "@/lib/admin/upload";
import StylesBuilder, { newDraftStyle, styleUnits, type DraftStyle } from "./StylesBuilder";

export default function ProductForm({
  product,
  categories,
  publishMode = false,
  hasVariants = false,
}: {
  product?: ProductRow;
  categories: Category[];
  /** true si el producto ya tiene estilos guardados (entonces se editan abajo, en “Estilos”) */
  hasVariants?: boolean;
  /** true cuando se llega con el botón "Publicar" desde la lista de productos */
  publishMode?: boolean;
}) {
  const router = useRouter();
  const isNew = !product;
  const folder = `productos/${product?.id ?? "nuevos"}`;

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState(product?.category ?? categories[0]?.id ?? "");
  const [price, setPrice] = useState(product && Number(product.price) > 0 ? String(product.price) : "");
  const [sizes, setSizes] = useState((product?.sizes ?? []).join(", "));
  const [badge, setBadge] = useState(product?.badge ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [active, setActive] = useState(publishMode ? true : product?.active ?? true);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [video, setVideo] = useState(product?.video_url ?? "");
  const [initialQty, setInitialQty] = useState("");
  const [initialCost, setInitialCost] = useState("");

  // ¿Varios diseños? Solo se pregunta cuando el producto existe y todavía no tiene estilos.
  const canChooseStyles = !isNew && !hasVariants;
  const [multi, setMulti] = useState(false);
  const [styles, setStyles] = useState<DraftStyle[]>(() => [newDraftStyle(), newDraftStyle()]);

  const [removed, setRemoved] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const photoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

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

  async function onVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadProductMedia(file, folder);
      if (video) setRemoved((prev) => [...prev, video]);
      setVideo(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el video.");
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

  function removeVideo() {
    if (video) setRemoved((prev) => [...prev, video]);
    setVideo("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const priceNum = Number(price);
    if (!name.trim()) return setError("Escribe el nombre del producto.");
    if (!price || !Number.isFinite(priceNum) || priceNum < 0) return setError("Escribe un precio de venta válido.");
    if (active && priceNum <= 0) return setError("Para que se vea en la tienda ponle un precio mayor a Q0, o quita la marca de “Visible en la tienda”.");
    const qtyNum = Number(initialQty);
    const costNum = Number(initialCost);
    if (isNew && initialQty && (!Number.isInteger(qtyNum) || qtyNum <= 0)) return setError("La cantidad inicial debe ser un número entero.");
    if (isNew && qtyNum > 0 && (!initialCost || !Number.isFinite(costNum) || costNum < 0)) return setError("Escribe cuánto te costó cada unidad.");

    const useStyles = canChooseStyles && multi;
    if (useStyles && product) {
      const names = styles.map((s) => s.name.trim().toLowerCase());
      if (styles.length < 2) return setError("Agrega al menos 2 diseños, o elige “No” si es un solo diseño.");
      if (names.some((n) => !n)) return setError("Escribe el color o diseño de cada uno.");
      if (new Set(names).size !== names.length) return setError("Dos diseños tienen el mismo nombre. Cámbiale uno.");
      const assigned = styles.reduce((n, s) => n + styleUnits(s), 0);
      if (assigned !== product.stock)
        return setError(
          assigned > product.stock
            ? `Repartiste ${assigned} unidades pero en bodega hay ${product.stock}.`
            : `Faltan ${product.stock - assigned} unidades por repartir entre los diseños (hay ${product.stock} en bodega).`,
        );
    }

    setSaving(true);
    const res = await saveProduct({
      id: product?.id,
      slug: slug || slugify(name),
      name,
      description,
      category,
      price: priceNum,
      sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
      badge: badge || null,
      featured,
      active,
      images,
      video_url: video || null,
    });

    if (!res.ok) {
      setSaving(false);
      return setError(res.error);
    }

    if (isNew && qtyNum > 0 && res.id) {
      const purchase = await createPurchase({
        product_id: res.id,
        qty: qtyNum,
        unit_cost: costNum,
        supplier: null,
        purchased_at: todayGT(),
        notes: "Stock inicial",
      });
      if (!purchase.ok) {
        setSaving(false);
        return setError(`El producto se guardó, pero no la compra inicial: ${purchase.error}`);
      }
    }

    if (useStyles && product) {
      // El primer diseño recibe todo el stock que ya estaba en bodega; los demás toman sus unidades de ese primero.
      let firstId = "";
      for (let i = 0; i < styles.length; i++) {
        const s = styles[i];
        const qty = styleUnits(s);
        const out = await saveVariant({
          product_id: product.id,
          name: s.name,
          images: s.images,
          active: true,
          ...(i > 0 && qty > 0 ? { take_from: firstId, take_qty: qty } : {}),
        });
        if (!out.ok) {
          setSaving(false);
          router.refresh();
          return setError(
            i === 0
              ? out.error
              : `Se guardaron ${i} de ${styles.length} diseños. Falló “${s.name.trim()}”: ${out.error} Los ya guardados los ves abajo en “Estilos”.`,
          );
        }
        if (i === 0) firstId = out.id ?? "";
      }
    }

    if (removed.length > 0) await removeProductMedia(removed);
    router.push("/admin/productos");
    router.refresh();
  }

  async function handleDelete() {
    if (!product) return;
    if (!window.confirm(`¿Borrar “${product.name}”? Se borrarán también sus compras, ventas y estilos. Esta acción no se puede deshacer.`)) return;
    setSaving(true);
    const res = await deleteProductFully(product.id);
    if (!res.ok) {
      setSaving(false);
      return setError(res.error);
    }
    await removeProductMedia([...images, ...(video ? [video] : [])]);
    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      {/* Datos */}
      <div className="card space-y-5 p-5 sm:p-6">
        {canChooseStyles && (
          <fieldset className="rounded-xl border border-brand-pink/25 bg-brand-pink-light/40 p-4">
            <legend className="px-1 text-sm font-semibold text-brand-ink">¿Tiene múltiples diseños de esta prenda?</legend>
            <p className="text-xs text-brand-ink/60">
              Por ejemplo una pijama en Gatitos, Corazones y Rosa. Si dices que sí, subes cada diseño por separado con su foto y sus unidades.
            </p>
            <div className="mt-3 flex gap-3">
              {([false, true] as const).map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => setMulti(v)}
                  aria-pressed={multi === v}
                  className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                    multi === v ? "bg-brand-pink-dark text-white shadow" : "bg-white text-brand-ink/70 ring-1 ring-brand-pink/30 hover:bg-white/80"
                  }`}
                >
                  {v ? "Sí, varios diseños" : "No, es uno solo"}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div>
          <label htmlFor="f-name" className="adm-label">Nombre</label>
          <input id="f-name" required className="input-field" value={name} onChange={(e) => onNameChange(e.target.value)} />
        </div>

        <div>
          <label htmlFor="f-desc" className="adm-label">Descripción</label>
          <textarea id="f-desc" rows={4} className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="f-cat" className="adm-label">Categoría</label>
            <select id="f-cat" className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-price" className="adm-label">Precio de venta (Q)</label>
            <input id="f-price" required type="number" min={0} step="0.01" inputMode="decimal" className="input-field" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="f-sizes" className="adm-label">Tallas (separadas por coma)</label>
            <input id="f-sizes" placeholder="S, M, L" className="input-field" value={sizes} onChange={(e) => setSizes(e.target.value)} />
          </div>
          <div>
            <label htmlFor="f-badge" className="adm-label">Etiqueta (ej. Nuevo, Popular)</label>
            <input id="f-badge" className="input-field" value={badge} onChange={(e) => setBadge(e.target.value)} />
          </div>
        </div>

        <div>
          <label htmlFor="f-slug" className="adm-label">Enlace del producto</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-brand-ink/50">/producto/</span>
            <input
              id="f-slug"
              className="input-field"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-brand-ink">
            <input type="checkbox" className="h-4 w-4 accent-[#e07fc3]" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Visible en la tienda
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-brand-ink">
            <input type="checkbox" className="h-4 w-4 accent-[#e07fc3]" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Destacado en el inicio
          </label>
        </div>

        {isNew ? (
          <div className="rounded-xl border border-brand-pink/25 bg-brand-pink-light/40 p-4">
            <p className="text-sm font-semibold text-brand-ink">Primera compra (opcional)</p>
            <p className="text-xs text-brand-ink/60">Si ya tienes unidades, anótalas aquí y entran a la bodega con su costo.</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="f-qty" className="adm-label">Cantidad</label>
                <input id="f-qty" type="number" min={1} step={1} inputMode="numeric" className="input-field" value={initialQty} onChange={(e) => setInitialQty(e.target.value)} />
              </div>
              <div>
                <label htmlFor="f-cost" className="adm-label">Costo por unidad (Q)</label>
                <input id="f-cost" type="number" min={0} step="0.01" inputMode="decimal" className="input-field" value={initialCost} onChange={(e) => setInitialCost(e.target.value)} />
              </div>
            </div>
          </div>
        ) : (
          <p className="rounded-xl bg-brand-lilac-light/60 p-3 text-sm text-brand-ink/70">
            Stock actual: <strong>{product.stock}</strong> unidades. Para cambiarlo registra una compra o una venta.
          </p>
        )}
      </div>

      {/* Fotos y video */}
      <div className="space-y-6">
        {canChooseStyles && multi && product ? (
          <StylesBuilder
            styles={styles}
            onChange={setStyles}
            stock={product.stock}
            folder={`productos/${product.id}/estilos`}
            uploading={uploading}
            onUploading={setUploading}
            onRemovedMedia={(urls) => setRemoved((prev) => [...prev, ...urls])}
            onError={setError}
          />
        ) : (
        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-brand-ink">Fotos</h2>
            <button type="button" onClick={() => photoInput.current?.click()} disabled={uploading} className="btn-outline inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold">
              {uploading ? <LoaderCircle size={16} className="animate-spin" /> : <ImagePlus size={16} />}
              Subir fotos
            </button>
          </div>
          <input ref={photoInput} type="file" accept="image/*" multiple hidden onChange={onPhotos} />

          {images.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-brand-pink/40 p-6 text-center text-sm text-brand-ink/50">
              Aún no hay fotos. La primera será la principal.
            </p>
          ) : (
            <ul className="mt-4 grid grid-cols-3 gap-3">
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
          <p className="mt-3 text-xs text-brand-ink/50">Las fotos se reducen y optimizan solas para que la tienda cargue rápido.</p>
        </div>
        )}

        <div className="card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-brand-ink">Video promocional</h2>
            <button type="button" onClick={() => videoInput.current?.click()} disabled={uploading} className="btn-outline inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold">
              {uploading ? <LoaderCircle size={16} className="animate-spin" /> : <Video size={16} />}
              {video ? "Cambiar video" : "Subir video"}
            </button>
          </div>
          <input ref={videoInput} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={onVideo} />

          {video ? (
            <div className="mt-4">
              <video src={video} controls playsInline preload="metadata" className="w-full rounded-xl bg-black" />
              <button type="button" onClick={removeVideo} className="mt-2 inline-flex items-center gap-1 text-sm text-red-600 hover:underline">
                <X size={14} /> Quitar video
              </button>
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-brand-pink/40 p-6 text-center text-sm text-brand-ink/50">
              Sin video. Se mostrará junto a las fotos del producto.
            </p>
          )}
          <p className="mt-3 text-xs text-brand-ink/50">MP4 o WebM, hasta {MAX_VIDEO_MB} MB.</p>
        </div>

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={saving || uploading} className="btn-primary inline-flex items-center gap-2 px-7 py-3 font-semibold">
            {saving ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Guardando…" : publishMode ? "Guardar y publicar" : "Guardar producto"}
          </button>
          {!isNew && (
            <button type="button" onClick={handleDelete} disabled={saving} className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50">
              <Trash2 size={16} /> Borrar
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
