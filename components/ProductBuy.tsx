"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/products";
import { addToCart } from "@/lib/cart";

export default function ProductBuy({ product }: { product: Product }) {
  const [size, setSize] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const needsSize = !!product.sizes?.length;
  const soldOut = product.inStock === false;
  const maxQty = product.stock && product.stock > 0 ? product.stock : 99;

  function handleAdd() {
    if (needsSize && !size) {
      setError("Elige una talla para continuar.");
      return;
    }
    setError("");
    addToCart(product.slug, qty, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="mt-6 space-y-5">
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
