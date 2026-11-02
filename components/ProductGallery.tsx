"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { Product } from "@/lib/products";
import ProductImage from "./ProductImage";
import { useProductView } from "./ProductViewContext";

type Item = { type: "image" | "video"; src: string };

/**
 * Fotos del producto y, si hay, su video promocional.
 * - Celular: se desliza con el dedo y abajo hay puntitos que indican en qué foto vas.
 * - Computadora: se cambia de foto con las miniaturas.
 * Si el cliente toca un estilo, la galería pasa a mostrar las fotos de ese estilo.
 */
export default function ProductGallery({ product }: { product: Product }) {
  const { previewId } = useProductView();
  const variant = product.variants?.find((v) => v.id === previewId);
  const photos =
    variant && variant.images.length > 0
      ? variant.images
      : product.images && product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [];
  // key: al cambiar de estilo la galería vuelve a la primera foto
  // Solo se muestra el nombre si ese estilo tiene sus propias fotos (si no, se ven las generales)
  const styleName = variant && variant.images.length > 0 ? variant.name : undefined;
  return <GalleryView key={variant?.id ?? "general"} product={product} photos={photos} styleName={styleName} />;
}

function GalleryView({ product, photos, styleName }: { product: Product; photos: string[]; styleName?: string }) {
  const items: Item[] = [
    ...photos.map((src) => ({ type: "image" as const, src })),
    ...(product.video ? [{ type: "video" as const, src: product.video }] : []),
  ];
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  if (items.length === 0) {
    return (
      <div className="card relative aspect-square overflow-hidden">
        <ProductImage product={product} sizes="(min-width: 768px) 50vw, 100vw" />
      </div>
    );
  }

  /** Mientras el cliente desliza, calcula en qué foto está para marcar el puntito. */
  function handleScroll() {
    const el = track.current;
    if (!el || el.clientWidth === 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setIndex((prev) => (prev === i ? prev : Math.max(0, Math.min(items.length - 1, i))));
  }

  function goTo(i: number) {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setIndex(i);
  }

  return (
    <div className="min-w-0">
      <div className="card relative overflow-hidden bg-brand-pink-light/40">
        {/* Carrusel: cada foto ocupa todo el ancho y se desliza con el dedo */}
        <div
          ref={track}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory items-center overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, i) => (
            <div key={item.src} className="w-full shrink-0 snap-center snap-always">
              {item.type === "image" ? (
                // La foto se muestra completa y con su propia proporción: sin recortes
                <Image
                  src={item.src}
                  alt={items.length > 1 ? `${product.name} — foto ${i + 1}` : product.name}
                  width={0}
                  height={0}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  draggable={false}
                  className="block h-auto w-full select-none"
                  priority={i === 0}
                />
              ) : (
                <video
                  src={item.src}
                  controls
                  playsInline
                  preload="metadata"
                  className="block aspect-video w-full bg-black object-contain"
                />
              )}
            </div>
          ))}
        </div>

        {styleName && (
          <span className="pointer-events-none absolute bottom-2 left-2 max-w-[80%] truncate rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-brand-ink shadow-sm backdrop-blur">
            <span className="font-normal text-brand-ink/60">Estilo: </span>
            {styleName}
          </span>
        )}

        {/* Puntitos (celular) */}
        {items.length > 1 && (
          <div className="pointer-events-none absolute bottom-2 right-3 flex gap-1.5 rounded-full bg-white/70 px-2 py-1 backdrop-blur md:hidden">
            {items.map((item, i) => (
              <span
                key={item.src}
                className={`h-2 rounded-full transition-all ${i === index ? "w-4 bg-brand-pink-dark" : "w-2 bg-brand-pink-dark/30"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Miniaturas (solo computadora) */}
      {items.length > 1 && (
        <div className="mt-3 hidden flex-wrap gap-2 px-1 py-1 md:flex">
          {items.map((item, i) => (
            <button
              key={item.src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={item.type === "video" ? "Ver video" : `Ver foto ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white ring-2 transition ${
                i === index ? "ring-brand-pink" : "ring-transparent hover:ring-brand-pink/40"
              }`}
            >
              {item.type === "image" ? (
                <Image src={item.src} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-pink-light to-brand-lilac-light text-brand-pink-dark">
                  <Play size={22} fill="currentColor" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
