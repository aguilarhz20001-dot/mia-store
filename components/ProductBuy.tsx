"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product, ProductVariant } from "@/lib/products";
import { addToCart } from "@/lib/cart";
import { formatQ } from "@/lib/format";
import { useProductView } from "./ProductViewContext";

const MAX_PER_LINE = 99;

export default function ProductBuy({ product }: { product: Product }) {
  const { previewId, setPreviewId } = useProductView();
  const [size, setSize] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);
  /** Cantidad elegida por estilo (para productos con estilos) */
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const needsSize = !!product.sizes?.length;
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const soldOut = product.inStock === false;
  const maxQty = product.stock && product.stock > 0 ? product.stock : MAX_PER_LINE;

  const pickedList = variants.filter((v) => (picked[v.id] ?? 0) > 0);
  const pickedUnits = pickedList.reduce((n, v) => n + (picked[v.id] ?? 0), 0);

  function changeVariantQty(v: ProductVariant, delta: number) {
    setError("");
    setPicked((prev) => {
      const next = Math.max(0, Math.min(v.stock || MAX_PER_LINE, (prev[v.id] ?? 0) + delta));
      return { ...prev, [v.id]: next };
    });
    if (delta > 0) setPreviewId(v.id);
  }

  function handleAdd() {
    if (needsSize && !size) {
      setError("Elige una talla para continuar.");
      return;
    }
    if (hasVariants) {
      if (pickedUnits === 0) {
        setError("Elige al menos un estilo para continuar.");
        return;
      }
      for (const v of pickedList) addToCart(product.slug, picked[v.id], size, v.id);
      setPicked({});
    } else {
      addToCart(product.slug, qty, size);
    }
    setError("");
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="mt-4 space-y-4 sm:mt-6 sm:space-y-5">
      {hasVariants && (
        <div>
          <p className="text-sm font-semibold text-brand-ink">
            Estilo <span className="font-normal text-brand-ink/60">(puedes elegir varios)</span>
          </p>
          <ul className="mt-2 space-y-2">
            {variants.map((v) => {
              const n = picked[v.id] ?? 0;
              const viewing = previewId === v.id;
              return (
                <li
                  key={v.id}
                  className={`flex items-center gap-3 rounded-2xl border p-2 pr-3 transition-colors ${
                    n > 0 ? "border-brand-pink bg-brand-pink-light/50" : viewing ? "border-brand-pink/60" : "border-brand-pink/20"
                  } ${v.inStock ? "" : "opacity-60"}`}
                >
                  <button
                    type="button"
                    onClick={() => setPreviewId(v.id)}
                    aria-label={`Ver fotos del estilo ${v.name}`}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-brand-pink-light to-brand-lilac-light">
                      {v.image && <Image src={v.image} alt="" fill sizes="56px" className="object-cover" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-brand-ink">{v.name}</span>
                      <span className="block text-xs text-brand-ink/55">
                        {!v.inStock ? "Agotado" : v.stock <= 3 ? `Quedan ${v.stock}` : "Disponible"}
                        {viewing && <span className="ml-2 font-semibold text-brand-pink-dark">· Viendo</span>}
                      </span>
                    </span>
                  </button>

                  {v.inStock && (
                    <div className="inline-flex shrink-0 items-center rounded-full border border-brand-pink/30 bg-white">
                      <button
                        type="button"
                        aria-label={`Menos ${v.name}`}
                        onClick={() => changeVariantQty(v, -1)}
                        disabled={n === 0}
                        className="flex h-9 w-9 items-center justify-center text-brand-pink-dark disabled:opacity-30"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{n}</span>
                      <button
                        type="button"
                        aria-label={`Más ${v.name}`}
                        onClick={() => changeVariantQty(v, 1)}
                        disabled={n >= v.stock}
                        className="flex h-9 w-9 items-center justify-center text-brand-pink-dark disabled:opacity-30"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {needsSize && (
        <div>
          <p className="text-sm font-semibold text-brand-ink">Talla</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.sizes!.map((s) => (
              <button
                key={s}
                type="button"
                data-active={size === s}
                onClick={() => {
                  setSize(s);
                  setError("");
                }}
                className="chip min-w-12 justify-center"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {!hasVariants && (
        <div>
          <p className="text-sm font-semibold text-brand-ink">Cantidad</p>
          <div className="mt-2 inline-flex items-center rounded-full border border-brand-pink/30 bg-white">
            <button
              type="button"
              aria-label="Menos"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-brand-pink-dark"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-semibold">{qty}</span>
            <button
              type="button"
              aria-label="Más"
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              className="w-10 h-10 flex items-center justify-center text-brand-pink-dark"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}

      {hasVariants && pickedUnits > 0 && (
        <p className="text-sm text-brand-ink/70">
          {pickedUnits} {pickedUnits === 1 ? "unidad" : "unidades"} ·{" "}
          <strong className="text-brand-pink-dark">{formatQ(pickedUnits * product.price)}</strong>
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut}
          className="btn-primary inline-flex items-center gap-2 px-7 py-3 font-semibold"
        >
          {added ? <Check size={18} /> : <ShoppingBag size={18} />}
          {soldOut ? "Agotado" : added ? "¡Agregado!" : "Agregar al carrito"}
        </button>
        {added && (
          <Link href="/carrito" className="btn-outline inline-flex items-center px-7 py-3 font-semibold">
            Ver carrito
          </Link>
        )}
      </div>
    </div>
  );
}
