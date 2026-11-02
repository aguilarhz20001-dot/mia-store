"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Flame, Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/products";
import { addToCart } from "@/lib/cart";
import { toggleFavorite, useFavorites } from "@/lib/favorites";
import { formatQ } from "@/lib/format";
import ProductImage from "../ProductImage";

/**
 * Tarjeta de la tienda: foto, etiqueta, corazón, nombre, precio y botón de carrito.
 * Si el producto tiene tallas o estilos, el carrito lleva a la ficha para elegir.
 * Si no, lo agrega directo.
 */
export default function ShopProductCard({ product, sizes }: { product: Product; sizes?: string }) {
  const { has } = useFavorites();
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const href = `/producto/${product.slug}`;
  const favorite = has(product.slug);
  const needsChoice = !!product.sizes?.length || !!product.variants?.length;
  const isBestSeller = product.badge?.toLowerCase().includes("vendido");

  function quickAdd() {
    addToCart(product.slug, 1);
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1600);
  }

  const cartClass =
    "flex h-10 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ee4f9c] to-[#dc3a8a] text-white shadow-md shadow-[#dc3a8a]/30 transition active:scale-95";

  return (
    <article className="flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-lg shadow-brand-pink/15 ring-1 ring-brand-pink/20">
      <div className="relative aspect-square overflow-hidden">
        <Link href={href} aria-label={product.name} className="absolute inset-0">
          <ProductImage product={product} sizes={sizes} />
        </Link>

        {product.badge && (
          <span className="pointer-events-none absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-gradient-to-r from-[#ee4f9c] to-[#dc3a8a] px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {isBestSeller && <Flame size={13} aria-hidden="true" />}
            {product.badge}
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleFavorite(product.slug)}
          aria-pressed={favorite}
          aria-label={favorite ? `Quitar ${product.name} de favoritos` : `Guardar ${product.name} en favoritos`}
          className="absolute right-2.5 top-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#dc3a8a] shadow-md transition active:scale-90"
        >
          <Heart size={22} fill={favorite ? "currentColor" : "none"} strokeWidth={2} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <Link href={href}>
          <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-brand-ink">{product.name}</h3>
        </Link>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Link href={href} className="text-xl font-bold text-[#dc3a8a]">
            {formatQ(product.price)}
          </Link>

          {needsChoice ? (
            <Link href={href} aria-label={`Elegir opciones de ${product.name}`} className={cartClass}>
              <ShoppingCart size={20} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={quickAdd}
              aria-label={added ? `${product.name} agregado al carrito` : `Agregar ${product.name} al carrito`}
              className={cartClass}
            >
              {added ? <Check size={20} /> : <ShoppingCart size={20} />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
