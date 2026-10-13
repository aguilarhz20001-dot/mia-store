"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, RotateCcw, Trash2, X } from "lucide-react";
import { cancelOrder, deleteOrder, fulfillOrder, reopenOrder, restoreOrder } from "@/app/admin/actions";
import type { ActionResult, OrderStatus } from "@/lib/admin/types";

export default function OrderActions({ id, number, status }: { id: string; number: number; status: OrderStatus }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(action: (id: string) => Promise<ActionResult>, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setError("");
    setBusy(true);
    const res = await action(id);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
  }

  const ghost = "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {status === "pendiente" && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(fulfillOrder, `¿Marcar el pedido #${number} como vendido? Se registran las ventas y se descuenta el stock.`)}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold"
            >
              {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />}
              Marcar vendido
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(cancelOrder, `¿Cancelar el pedido #${number}? No se descuenta nada del stock.`)}
              className={`${ghost} text-red-600 hover:bg-red-50`}
            >
              <X size={16} /> Cancelar
            </button>
          </>
        )}

        {status === "vendido" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(reopenOrder, `¿Deshacer la venta del pedido #${number}? Las unidades vuelven a la bodega y el pedido queda pendiente.`)}
            className={`${ghost} text-brand-ink/70 hover:bg-brand-pink-light`}
          >
            <RotateCcw size={16} /> Deshacer venta
          </button>
        )}

        {status === "cancelado" && (
          <>
            <button type="button" disabled={busy} onClick={() => run(restoreOrder)} className={`${ghost} text-brand-ink/70 hover:bg-brand-pink-light`}>
              <RotateCcw size={16} /> Volver a pendiente
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(deleteOrder, `¿Borrar el pedido #${number} para siempre?`)}
              className={`${ghost} text-red-600 hover:bg-red-50`}
            >
              <Trash2 size={16} /> Borrar
            </button>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
