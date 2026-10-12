"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { deleteCategory, moveCategory, saveCategory } from "@/app/admin/actions";
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from "@/components/iconMap";

export type CategoryItem = { id: string; label: string; description: string; icon: string; count: number };

function CategoryFields({
  idPrefix,
  label,
  description,
  icon,
  onChange,
}: {
  idPrefix: string;
  label: string;
  description: string;
  icon: string;
  onChange: (next: { label: string; description: string; icon: string }) => void;
}) {
  const Icon = getCategoryIcon(icon);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1.4fr_auto]">
      <div>
        <label htmlFor={`${idPrefix}-label`} className="adm-label">Nombre</label>
        <input id={`${idPrefix}-label`} required className="input-field" value={label} onChange={(e) => onChange({ label: e.target.value, description, icon })} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-desc`} className="adm-label">Descripción corta (la ve el cliente)</label>
        <input id={`${idPrefix}-desc`} className="input-field" value={description} onChange={(e) => onChange({ label, description: e.target.value, icon })} />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-icon`} className="adm-label">Ícono</label>
        <div className="flex items-center gap-2">
          <span className="icon-badge shrink-0" aria-hidden>
            <Icon size={20} />
          </span>
          <select id={`${idPrefix}-icon`} className="input-field" value={icon} onChange={(e) => onChange({ label, description, icon: e.target.value })}>
            {CATEGORY_ICON_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default function CategoryManager({ items }: { items: CategoryItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // Formulario para agregar
  const [draft, setDraft] = useState({ label: "", description: "", icon: "tag" });
  // Edición en la lista
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState({ label: "", description: "", icon: "tag" });

  async function run(action: () => Promise<{ ok: boolean; error?: string }>, success?: string) {
    setError("");
    setOk("");
    setBusy(true);
    const res = await action();
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "No se pudo guardar.");
      return false;
    }
    if (success) setOk(success);
    router.refresh();
    return true;
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const done = await run(() => saveCategory(draft), `Categoría «${draft.label.trim()}» agregada.`);
    if (done) setDraft({ label: "", description: "", icon: "tag" });
  }

  function startEdit(c: CategoryItem) {
    setEditingId(c.id);
    setEdit({ label: c.label, description: c.description, icon: c.icon });
    setError("");
    setOk("");
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    const done = await run(() => saveCategory({ id: editingId, ...edit }), "Cambios guardados.");
    if (done) setEditingId(null);
  }

  async function handleDelete(c: CategoryItem) {
    if (!window.confirm(`¿Borrar la categoría «${c.label}»? Esta acción no se puede deshacer.`)) return;
    await run(() => deleteCategory(c.id), `Categoría «${c.label}» borrada.`);
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="card p-5 sm:p-6">
        <h2 className="font-semibold text-brand-ink">Agregar categoría</h2>
        <div className="mt-4">
          <CategoryFields idPrefix="new" {...draft} onChange={setDraft} />
        </div>
        <div className="mt-5">
          <button type="submit" disabled={busy} className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 font-semibold">
            <Plus size={18} />
            {busy ? "Guardando…" : "Agregar categoría"}
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-emerald-600">{ok}</p>}

      <section className="card overflow-hidden">
        {items.length === 0 && <p className="p-8 text-center text-brand-ink/50">Aún no tienes categorías. Agrega la primera arriba.</p>}
        <ul className="divide-y divide-brand-pink/15">
          {items.map((c, i) => {
            const Icon = getCategoryIcon(c.icon);
            const editing = editingId === c.id;
            return (
              <li key={c.id} className="p-4 sm:p-5">
                {editing ? (
                  <form onSubmit={handleSaveEdit}>
                    <CategoryFields idPrefix={`edit-${c.id}`} {...edit} onChange={setEdit} />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="submit" disabled={busy} className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold">
                        <Check size={16} /> Guardar
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-brand-ink/70 hover:bg-brand-pink-light">
                        <X size={16} /> Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="icon-badge shrink-0" aria-hidden>
                      <Icon size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-brand-ink">{c.label}</p>
                      <p className="truncate text-sm text-brand-ink/60">{c.description || "Sin descripción"}</p>
                    </div>
                    <span className="text-sm text-brand-ink/60">
                      {c.count} {c.count === 1 ? "producto" : "productos"}
                    </span>
                    <div className="flex items-center gap-1">
                      <button type="button" aria-label="Subir" disabled={busy || i === 0} onClick={() => run(() => moveCategory(c.id, -1))} className="rounded-full p-2 text-brand-ink/70 hover:bg-brand-pink-light disabled:opacity-30">
                        <ChevronUp size={18} />
                      </button>
                      <button type="button" aria-label="Bajar" disabled={busy || i === items.length - 1} onClick={() => run(() => moveCategory(c.id, 1))} className="rounded-full p-2 text-brand-ink/70 hover:bg-brand-pink-light disabled:opacity-30">
                        <ChevronDown size={18} />
                      </button>
                      <button type="button" aria-label="Editar" onClick={() => startEdit(c)} className="rounded-full p-2 text-brand-ink/70 hover:bg-brand-pink-light">
                        <Pencil size={17} />
                      </button>
                      <button
                        type="button"
                        aria-label="Borrar"
                        title={c.count > 0 ? "Tiene productos: pásalos a otra categoría primero" : "Borrar categoría"}
                        disabled={busy || c.count > 0}
                        onClick={() => handleDelete(c)}
                        className="rounded-full p-2 text-red-500 hover:bg-red-50 disabled:opacity-30"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
