"use client";

import { useState } from "react";
import type { Category } from "@/lib/categories";
import ReceiveStockForm from "./ReceiveStockForm";
import PurchaseForm, { type PurchaseOption } from "./PurchaseForm";

/** Entrada a la bodega: mercadería nueva, o reponer un producto que ya existe. */
export default function StockIntake({
  today,
  categories,
  options,
  initialProductId,
}: {
  today: string;
  categories: Category[];
  options: PurchaseOption[];
  initialProductId?: string;
}) {
  const canRestock = options.length > 0;
  const [mode, setMode] = useState<"nuevo" | "reponer">(initialProductId && canRestock ? "reponer" : "nuevo");

  return (
    <div className="mb-8">
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" data-active={mode === "nuevo"} className="chip" onClick={() => setMode("nuevo")}>
          Producto nuevo
        </button>
        <button
          type="button"
          data-active={mode === "reponer"}
          className="chip"
          disabled={!canRestock}
          title={canRestock ? undefined : "Primero ingresa un producto nuevo"}
          onClick={() => setMode("reponer")}
        >
          Reponer uno que ya tengo
        </button>
      </div>

      {mode === "nuevo" ? (
        <ReceiveStockForm today={today} categories={categories} />
      ) : (
        <PurchaseForm options={options} today={today} initialProductId={initialProductId} />
      )}
    </div>
  );
}
