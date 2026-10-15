"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { Product } from "@/lib/products";
import ProductImage from "./ProductImage";
import { useProductView } from "./ProductViewContext";

type Item = { type: "image" | "video"; src: string };

/**
 * Fotos del producto con miniaturas y, si hay, su video promocional.
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

  if (items.length === 0) {
    return (
      <div className="card relative aspect-square overflow-hidden">
        <ProductImage product={product} sizes="(min-width: 768px) 50vw, 100vw" />
      </div>
    );
  }

  const current = items[Math.min(index, items.length - 1)];

  return (
    <div>
      <div className="card relative aspect-square overflow-hidden bg-white">
        {current.type === "image" ? (
          <Image
            key={current.src}
            src={current.src}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-contain"
            priority={index === 0}
          />
        ) : (
          <video
            key={current.src}
            src={current.src}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full bg-black object-contain"
          />
        )}
        {styleName && (
          <span className="pointer-events-none absolute bottom-2 left-2 max-w-[80%] truncate rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-brand-ink shadow-sm backdrop-blur">
            <span className="font-normal text-brand-ink/60">Estilo: </span>
            {styleName}
          </span>
        )}
      </div>

      {items.length > 1 && (
        <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 py-1 md:mt-3 md:flex-wrap">
          {items.map((item, i) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={item.type === "video" ? "Ver video" : `Ver foto ${i + 1}`}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white ring-2 transition md:h-16 md:w-16 ${
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
