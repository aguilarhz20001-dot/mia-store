"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { Product } from "@/lib/products";
import ProductImage from "./ProductImage";

type Item = { type: "image" | "video"; src: string };

/** Fotos del producto con miniaturas y, si hay, su video promocional. */
export default function ProductGallery({ product }: { product: Product }) {
  const photos = product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : [];
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
            className="object-cover"
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
      </div>

      {items.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item, i) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={item.type === "video" ? "Ver video" : `Ver foto ${i + 1}`}
              className={`relative h-16 w-16 overflow-hidden rounded-xl bg-white ring-2 transition ${
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
