"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { saveClosing } from "@/app/admin/actions";

export default function CloseForm({ defaultName, start, end }: { defaultName: string; start: string; end: string }) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await saveClosing({ name, start, end, notes: notes || null });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push(`/admin/cuadre/${res.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-6">
      <h2 className="font-semibold text-brand-ink">Cerrar y guardar este cuadre</h2>
      <p className="mt-1 text-sm text-brand-ink/60">
        Se guarda una foto de estos números. Si después corriges o borras una venta vieja, el cuadre guardado no cambia.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="adm-label">Nombre del cuadre</label>
          <input id="c-name" required className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="c-notes" className="adm-label">Notas (opcional)</label>
          <input id="c-notes" className="input-field" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      <div className="mt-5">
        <button type="submit" disabled={busy} className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 font-semibold">
          <Lock size={18} />
          {busy ? "Guardando…" : "Cerrar cuadre"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </form>
  );
}
