"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Menu, Star, X } from "lucide-react";
import { getCategoryIcon } from "../iconMap";

type MenuCategory = { id: string; label: string; icon: string };

/**
 * Botón discreto con las 3 rayitas. Al tocarlo despliega las categorías para elegir.
 * Cuando hay una categoría elegida, el botón muestra su nombre.
 */
export default function CategoryMenu({
  categories,
  activeId,
}: {
  categories: MenuCategory[];
  activeId?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = categories.find((c) => c.id === activeId);

  const items = [
    { key: "todo", href: "/tienda", label: "Todo", Icon: Star, isActive: !activeId },
    ...categories.map((c) => ({
      key: c.id,
      href: `/tienda?categoria=${encodeURIComponent(c.id)}`,
      label: c.label,
      Icon: getCategoryIcon(c.icon),
      isActive: activeId === c.id,
    })),
  ];

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Cerrar categorías" : "Elegir categoría"}
        className={`flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-medium ring-1 transition-colors ${
          active || open
            ? "bg-brand-pink-light text-brand-pink-dark ring-brand-pink/40"
            : "bg-white/80 text-brand-ink/80 ring-brand-pink/25 hover:bg-brand-pink-light/70"
        }`}
      >
        {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        <span className="max-w-[7.5rem] truncate">{active ? active.label : "Categorías"}</span>
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-full z-30 mt-2 w-[min(21rem,calc(100vw-2rem))] rounded-3xl bg-white p-2 shadow-xl shadow-brand-pink/25 ring-1 ring-brand-pink/25"
        >
          <ul className="grid grid-cols-2 gap-1">
            {items.map(({ key, href, label, Icon, isActive }) => (
              <li key={key}>
                <Link
                  href={href}
                  scroll={false}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-2.5 rounded-2xl px-2.5 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-brand-pink-light font-semibold text-brand-pink-dark"
                      : "font-medium text-brand-ink/80 hover:bg-brand-pink-light/60"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isActive
                        ? "bg-gradient-to-br from-[#ee4f9c] to-[#dc3a8a] text-white"
                        : "bg-brand-pink-light text-brand-pink-dark"
                    }`}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 leading-tight">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
