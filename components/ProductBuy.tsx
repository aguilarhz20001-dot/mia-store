"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product, ProductVariant } from "@/lib/products";
import { addToCart } from "@/lib/cart";
import { formatQ } from "@/lib/format";
import { useProductView } from "./ProductViewContext";

const MAX_PER_LINE = 99;

/** Colores de los puntitos de cada estilo (se repiten si hay más estilos que colores). */
const DOT_COLORS = ["#d6338a", "#a58cf5", "#ff5fa8", "#1f3a8a", "#c026a3", "#7c5cd6"];

export default function ProductBuy({ product }: { product: Product }) {
  const { previewId, setPreviewId } = useProductView();
  const [size, setSize] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);
  /** Cantidad elegida por estilo (para productos con estilos) */
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const needsSize = !!product.sizes?.length;
  // Los estilos agotados no se muestran al cliente
  const variants = (product.variants ?? []).filter((v) => v.inStock);
  const hasVariants = (product.variants ?? []).length > 0;
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

  /** Tocar un estilo solo muestra sus fotos; no lo agrega a la compra. */
  function viewVariant(v: ProductVariant) {
    setPreviewId(v.id);
  }

  /** El botón «Agregar» del estilo lo pone en la compra (1 unidad) y muestra sus fotos. */
  function addVariant(v: ProductVariant) {
    setError("");
    setPreviewId(v.id);
    setPicked((prev) => ((prev[v.id] ?? 0) > 0 ? prev : { ...prev, [v.id]: 1 }));
  }

  /** Contador de unidades de un estilo (+ / −). */
  function stepper(v: ProductVariant, n: number) {
    return (
      <div className="flex items-center justify-between rounded-full border border-brand-pink/30 bg-white">
        <button
          type="button"
          aria-label={`Menos ${v.name}`}
          onClick={() => changeVariantQty(v, -1)}
          className="flex h-8 w-9 items-center justify-center text-brand-pink-dark"
        >
          <Minus size={15} />
        </button>
        <span className="text-sm font-semibold">{n}</span>
        <button
          type="button"
          aria-label={`Más ${v.name}`}
          onClick={() => changeVariantQty(v, 1)}
          disabled={n >= v.stock}
          className="flex h-8 w-9 items-center justify-center text-brand-pink-dark disabled:opacity-30"
        >
          <Plus size={15} />
        </button>
      </div>
    );
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
      {variants.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-brand-ink">
            Elige tu estilo <span className="font-normal text-brand-ink/60">(puedes elegir varios)</span>
          </p>
          {/* Celular: tarjetas pequeñas que se deslizan de lado. Tablet y compu: cuadrícula. */}
          <ul className="-mx-4 mt-2 flex snap-x gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-2.5 sm:overflow-visible sm:px-0 sm:pb-0">
            {variants.map((v, i) => {
              const n = picked[v.id] ?? 0;
              const selected = n > 0;
              const viewing = previewId === v.id;
              return (
                <li
                  key={v.id}
                  className={`w-[8.75rem] shrink-0 snap-start rounded-2xl border p-2.5 transition-colors sm:w-auto sm:p-3 ${
                    selected
                      ? "border-brand-pink bg-brand-pink-light/60"
                      : viewing
                        ? "border-brand-pink/60 bg-white"
                        : "border-brand-pink/20 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {/* Tocar el nombre = solo ver las fotos de este estilo */}
                    <button
                      type="button"
                      onClick={() => viewVariant(v)}
                      aria-label={`Ver fotos del estilo ${v.name}`}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left sm:gap-2.5"
                    >
                      <span
                        className="h-3 w-3 shrink-0 rounded-full sm:h-3.5 sm:w-3.5"
                        style={{ backgroundColor: DOT_COLORS[i % DOT_COLORS.length] }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-brand-ink sm:text-base">{v.name}</span>
                        <span className="block text-xs text-brand-ink/55">
                          {viewing ? (
                            <span className="font-semibold text-brand-pink-dark">Viendo</span>
                          ) : v.stock <= 3 ? (
                            `Quedan ${v.stock}`
                          ) : (
                            "Disponible"
                          )}
                        </span>
                      </span>
                    </button>

                    {selected && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-pink-dark text-white sm:h-6 sm:w-6">
                        <Check size={13} strokeWidth={3} />
                      </span>
                    )}
                    {/* Tablet y compu: «Agregar» al lado del nombre */}
                    {!selected && (
                      <button
                        type="button"
                        onClick={() => addVariant(v)}
                        aria-label={`Agregar el estilo ${v.name} a la compra`}
                        className="hidden shrink-0 items-center gap-1 rounded-full border border-brand-pink/40 bg-white px-2.5 py-1 text-xs font-semibold text-brand-pink-dark hover:bg-brand-pink-light/60 sm:inline-flex"
                      >
                        <Plus size={13} /> Agregar
                      </button>
                    )}
                  </div>

                  {/* Celular: abajo siempre hay una sola fila (Agregar o el contador), así las tarjetas no cambian de alto */}
                  <div className="mt-2 sm:hidden">
                    {selected ? (
                      stepper(v, n)
                    ) : (
                      <button
                        type="button"
                        onClick={() => addVariant(v)}
                        aria-label={`Agregar el estilo ${v.name} a la compra`}
                        className="flex h-8 w-full items-center justify-center gap-1 rounded-full border border-brand-pink/40 bg-white text-xs font-semibold text-brand-pink-dark active:bg-brand-pink-light/60"
                      >
                        <Plus size={13} /> Agregar
                      </button>
                    )}
                  </div>
                  {selected && <div className="mt-2.5 hidden sm:block">{stepper(v, n)}</div>}
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
