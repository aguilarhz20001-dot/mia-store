"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProductFully } from "@/app/admin/actions";
import { removeProductMedia } from "@/lib/admin/upload";

/** Borra un producto completo (con sus compras, ventas y estilos) y sus fotos. */
export default function DeleteProductButton({
  id,
  name,
  media,
  purchases,
  sales,
}: {
  id: string;
  name: string;
  /** URLs de fotos y video, para borrarlas del almacenamiento */
  media: string[];
  purchases: number;
  sales: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    const extra =
      purchases > 0 || sales > 0
        ? `\n\nTambién se borrarán sus ${purchases} unidades compradas y ${sales} vendidas, así que las ventas de este producto dejarán de contar en tus ganancias. Los cuadres ya guardados no cambian.`
        : "";
    if (!window.confirm(`¿Borrar “${name}” por completo? Esta acción no se puede deshacer.${extra}`)) return;
    setBusy(true);
    const res = await deleteProductFully(id);
    if (!res.ok) {
      setBusy(false);
      window.alert(res.error);
      return;
    }
    try {
      await removeProductMedia(media);
    } catch {
      // las fotos sueltas no son importantes: el producto ya se borró
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={`Borrar ${name}`}
      title="Borrar producto"
      className="rounded-lg p-2 text-brand-ink/40 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
    >
      <Trash2 size={16} />
    </button>
  );
}
