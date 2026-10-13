"use client";

import { useRef } from "react";
import { ImagePlus, LoaderCircle, Plus, Star, Trash2, X } from "lucide-react";
import { uploadProductMedia } from "@/lib/admin/upload";

/** Un diseño que todavía no se ha guardado (se crea al guardar el producto). */
export type DraftStyle = {
  key: string;
  name: string;
  /** Unidades de este diseño (texto, para poder dejar el campo vacío mientras se escribe) */
  qty: string;
  images: string[];
};

let counter = 0;
export function newDraftStyle(): DraftStyle {
  counter += 1;
  return { key: `d${Date.now()}-${counter}`, name: "", qty: "", images: [] };
}

export function styleUnits(s: DraftStyle) {
  const n = Number(s.qty);
  return Number.isInteger(n) && n > 0 ? n : 0;
}

/**
 * Constructor de diseños: se llena desde el inicio, con nombre (color o diseño), fotos y unidades.
 * Las unidades salen del stock que ya está en bodega: la suma nunca puede pasar de ese total.
 */
export default function StylesBuilder({
  styles,
  onChange,
  stock,
  folder,
  uploading,
  onUploading,
  onRemovedMedia,
  onError,
}: {
  styles: DraftStyle[];
  onChange: (next: DraftStyle[]) => void;
  /** Unidades que ya hay en bodega para este producto */
  stock: number;
  folder: string;
  uploading: boolean;
  onUploading: (v: boolean) => void;
  /** Fotos quitadas: se borran del almacenamiento al guardar */
  onRemovedMedia: (urls: string[]) => void;
  onError: (message: string) => void;
}) {
  const assigned = styles.reduce((n, s) => n + styleUnits(s), 0);
  const left = stock - assigned;

  function patch(key: string, change: Partial<DraftStyle>) {
    onChange(styles.map((s) => (s.key === key ? { ...s, ...change } : s)));
  }

  function setQty(key: string, value: string) {
    // Nunca deja repartir más de lo que hay en bodega.
    const others = styles.filter((s) => s.key !== key).reduce((n, s) => n + styleUnits(s), 0);
    const max = Math.max(0, stock - others);
    const cleaned = value.replace(/[^\d]/g, "");
    if (cleaned === "") return patch(key, { qty: "" });
    patch(key, { qty: String(Math.min(Number(cleaned), max)) });
  }

  async function addPhotos(key: string, files: File[]) {
    if (files.length === 0) return;
    onError("");
    onUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) urls.push(await uploadProductMedia(file, folder));
      onChange(styles.map((s) => (s.key === key ? { ...s, images: [...s.images, ...urls] } : s)));
    } catch (err) {
      onError(err instanceof Error ? err.message : "No se pudo subir la foto.");
    } finally {
      onUploading(false);
    }
  }

  function removeStyle(s: DraftStyle) {
    if (s.images.length > 0) onRemovedMedia(s.images);
    onChange(styles.filter((x) => x.key !== s.key));
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-brand-ink">Diseños</h2>
        <p
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            left === 0 ? "bg-emerald-50 text-emerald-700" : left < 0 ? "bg-red-50 text-red-700" : "bg-brand-lilac-light text-brand-ink/70"
          }`}
        >
          {left === 0 ? `Listo: repartiste las ${stock} unidades` : `Repartidas ${assigned} de ${stock} · faltan ${left}`}
        </p>
      </div>
      <p className="mt-1 text-xs text-brand-ink/60">
        Cada diseño lleva su foto y sus unidades. Las unidades salen de las {stock} que ya tienes en bodega: no se agregan más.
      </p>

      <ul className="mt-4 space-y-4">
        {styles.map((s, i) => (
          <StyleRow
            key={s.key}
            index={i}
            style={s}
            max={Math.max(0, stock - (assigned - styleUnits(s)))}
            uploading={uploading}
            canRemove={styles.length > 1}
            onName={(v) => patch(s.key, { name: v })}
            onQty={(v) => setQty(s.key, v)}
            onPhotos={(files) => addPhotos(s.key, files)}
            onCover={(url) => patch(s.key, { images: [url, ...s.images.filter((u) => u !== url)] })}
            onRemovePhoto={(url) => {
              onRemovedMedia([url]);
              patch(s.key, { images: s.images.filter((u) => u !== url) });
            }}
            onRemove={() => removeStyle(s)}
          />
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onChange([...styles, newDraftStyle()])}
        className="btn-outline mt-4 inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold"
      >
        <Plus size={16} /> Agregar otro diseño
      </button>
    </div>
  );
}

function StyleRow({
  index,
  style,
  max,
  uploading,
  canRemove,
  onName,
  onQty,
  onPhotos,
  onCover,
  onRemovePhoto,
  onRemove,
}: {
  index: number;
  style: DraftStyle;
  max: number;
  uploading: boolean;
  canRemove: boolean;
  onName: (v: string) => void;
  onQty: (v: string) => void;
  onPhotos: (files: File[]) => void;
  onCover: (url: string) => void;
  onRemovePhoto: (url: string) => void;
  onRemove: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <li className="rounded-2xl border border-brand-pink/25 bg-white/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-brand-ink">Diseño {index + 1}</p>
        {canRemove && (
          <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
            <Trash2 size={13} /> Quitar
          </button>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_7rem]">
        <div>
          <label className="adm-label">Color o diseño</label>
          <input className="input-field" placeholder="Ej. Gatitos, Corazones, Rosa…" value={style.name} onChange={(e) => onName(e.target.value)} />
        </div>
        <div>
          <label className="adm-label">Unidades</label>
          <input
            type="number"
            min={0}
            max={max}
            step={1}
            inputMode="numeric"
            className="input-field"
            value={style.qty}
            onChange={(e) => onQty(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="adm-label !mb-0">Fotos de este diseño</p>
        <button type="button" onClick={() => input.current?.click()} disabled={uploading} className="btn-outline inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold">
          {uploading ? <LoaderCircle size={15} className="animate-spin" /> : <ImagePlus size={15} />}
          Subir fotos
        </button>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          onPhotos(files);
        }}
      />

      {style.images.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-brand-pink/40 p-4 text-center text-sm text-brand-ink/50">Sin fotos. La primera será la principal.</p>
      ) : (
        <ul className="mt-3 grid grid-cols-3 gap-3">
          {style.images.map((url, i) => (
            <li key={url} className="relative overflow-hidden rounded-xl bg-white ring-1 ring-brand-pink/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Foto ${i + 1}`} className="aspect-square w-full object-cover" />
              {i === 0 ? (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-brand-pink-dark px-2 py-0.5 text-[10px] font-semibold text-white">Principal</span>
              ) : (
                <button type="button" onClick={() => onCover(url)} title="Hacer principal" aria-label="Hacer principal" className="absolute left-1.5 top-1.5 rounded-full bg-white/90 p-1 text-brand-pink-dark shadow hover:bg-white">
                  <Star size={13} />
                </button>
              )}
              <button type="button" onClick={() => onRemovePhoto(url)} title="Quitar foto" aria-label="Quitar foto" className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-red-600 shadow hover:bg-white">
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
