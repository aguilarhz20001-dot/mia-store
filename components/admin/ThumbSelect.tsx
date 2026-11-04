"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Check, ChevronDown, ImageOff, Plus, X } from "lucide-react";

export type ThumbItem = {
  value: string;
  label: string;
  /** Foto del producto o estilo (si no tiene, se muestra un recuadro vacío) */
  image?: string | null;
  /** Opción sin foto, como «＋ Nuevo estilo…» (muestra un + en lugar de la miniatura) */
  plain?: boolean;
};

type Zoom = { src: string; alt: string };

/** Miniatura cuadrada. Con foto, al tocarla se abre en grande. */
function Thumb({ src, alt, size, onZoom }: { src?: string | null; alt: string; size: number; onZoom: (z: Zoom) => void }) {
  const box = { width: size, height: size };
  if (!src) {
    return (
      <span
        style={box}
        className="flex shrink-0 items-center justify-center rounded-lg bg-brand-pink-light/60 text-brand-pink-dark/50 ring-1 ring-brand-pink/20"
        aria-hidden="true"
      >
        <ImageOff size={Math.round(size * 0.4)} />
      </span>
    );
  }
  return (
    <button
      type="button"
      style={box}
      onClick={(e) => {
        e.stopPropagation();
        onZoom({ src, alt });
      }}
      aria-label={`Ver la foto de ${alt} en grande`}
      className="relative shrink-0 cursor-zoom-in overflow-hidden rounded-lg ring-1 ring-brand-pink/25 transition hover:ring-2 hover:ring-brand-pink"
    >
      <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" />
    </button>
  );
}

/**
 * Selector con miniaturas: cada opción muestra su foto y su nombre.
 * Tocar el nombre elige la opción; tocar la miniatura abre la foto en grande.
 */
export default function ThumbSelect({
  id,
  items,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  items: ThumbItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState<Zoom | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const selected = items.find((i) => i.value === value);

  // Cerrar la lista al tocar afuera o con Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Foto en grande: Escape la cierra y la página no se desplaza por detrás
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(null);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [zoom]);

  return (
    <div ref={wrap} className="relative">
      <div className="input-field flex items-center gap-3 !p-1.5 !pr-3 focus-within:!border-brand-pink focus-within:ring-[3px] focus-within:ring-brand-pink/20">
        {selected && !selected.plain ? (
          <Thumb src={selected.image} alt={selected.label} size={44} onZoom={setZoom} />
        ) : (
          <span className="h-11 w-11 shrink-0 rounded-lg border border-dashed border-brand-pink/40" aria-hidden="true" />
        )}
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-2 text-left outline-none"
        >
          <span className={`truncate ${selected ? "" : "text-brand-ink/50"}`}>{selected?.label ?? placeholder}</span>
          <ChevronDown size={18} className={`shrink-0 text-brand-ink/60 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </div>

      {open && (
        <ul className="absolute left-0 right-0 z-30 mt-1.5 max-h-80 overflow-y-auto rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-brand-pink/25">
          {items.map((it) => (
            <li
              key={it.value}
              className={`flex items-center gap-2 rounded-xl p-1 ${it.value === value ? "bg-brand-pink-light/60" : "hover:bg-brand-pink-light/40"}`}
            >
              {it.plain ? (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-pink-light/60 text-brand-pink-dark" aria-hidden="true">
                  <Plus size={22} />
                </span>
              ) : (
                <Thumb src={it.image} alt={it.label} size={56} onZoom={setZoom} />
              )}
              <button
                type="button"
                onClick={() => {
                  onChange(it.value);
                  setOpen(false);
                }}
                className="flex min-h-14 min-w-0 flex-1 items-center justify-between gap-2 pr-2 text-left"
              >
                <span className="truncate">{it.label}</span>
                {it.value === value && <Check size={18} className="shrink-0 text-brand-pink-dark" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}

      {zoom &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={zoom.alt}
            onClick={() => setZoom(null)}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-black/80 p-4"
          >
            <div className="relative h-[78vh] w-full max-w-3xl">
              <Image src={zoom.src} alt={zoom.alt} fill sizes="(min-width: 768px) 48rem, 100vw" className="object-contain" />
            </div>
            <p className="text-center text-sm font-medium text-white">{zoom.alt}</p>
            <button
              type="button"
              onClick={() => setZoom(null)}
              aria-label="Cerrar foto"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-ink shadow-lg"
            >
              <X size={22} />
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
