"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { ActionResult } from "@/lib/admin/types";

export default function DeleteButton({
  action,
  id,
  confirmText,
  label = "Borrar",
}: {
  action: (id: string) => Promise<ActionResult>;
  id: string;
  confirmText: string;
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    const res = await action(id);
    setBusy(false);
    if (!res.ok) {
      window.alert(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={label}
      title={label}
      className="rounded-lg p-2 text-brand-ink/40 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
    >
      <Trash2 size={16} />
    </button>
  );
}
