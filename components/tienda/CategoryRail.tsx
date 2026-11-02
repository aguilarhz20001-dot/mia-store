"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import { getCategoryIcon } from "../iconMap";

type RailCategory = { id: string; label: string; icon: string };

/** Fila de categorías en círculos. Se desliza de lado y muestra una flecha si hay más. */
export default function CategoryRail({
  categories,
  activeId,
}: {
  categories: RailCategory[];
  activeId?: string;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [categories.length]);

  const items: { key: string; href: string; label: string; Icon: typeof Star; active: boolean }[] = [
    { key: "todo", href: "/tienda", label: "Todo", Icon: Star, active: !activeId },
    ...categories.map((c) => ({
      key: c.id,
      href: `/tienda?categoria=${encodeURIComponent(c.id)}`,
      label: c.label,
      Icon: getCategoryIcon(c.icon),
      active: activeId === c.id,
    })),
  ];

  return (
    <nav
      aria-label="Categorías"
      className="relative rounded-[2rem] bg-white/75 py-2 shadow-md shadow-brand-pink/15 ring-1 ring-brand-pink/20 backdrop-blur-sm"
    >
      <ul
        ref={ref}
        className="flex gap-1 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>li:first-child]:ml-auto [&>li:last-child]:mr-auto"
      >
        {items.map(({ key, href, label, Icon, active }) => (
          <li key={key} className="shrink-0">
            <Link
              href={href}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={`flex w-[5.5rem] flex-col items-center gap-1.5 rounded-3xl px-1 pb-2 pt-2.5 text-center transition-colors sm:w-24 ${
                active ? "bg-brand-pink-light" : "hover:bg-brand-pink-light/60"
              }`}
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full transition-transform ${
                  active
                    ? "bg-gradient-to-br from-[#ee4f9c] to-[#dc3a8a] text-white shadow-lg shadow-[#dc3a8a]/35"
                    : "bg-gradient-to-br from-brand-pink-light to-white text-brand-pink-dark ring-1 ring-brand-pink/25"
                }`}
              >
                <Icon size={26} strokeWidth={active ? 2 : 1.6} fill={active && key === "todo" ? "currentColor" : "none"} />
              </span>
              <span
                className={`line-clamp-2 w-full text-[13px] leading-tight ${
                  active ? "font-semibold text-brand-pink-dark" : "font-medium text-brand-ink/80"
                }`}
              >
                {label}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {canNext && (
        <button
          type="button"
          aria-label="Ver más categorías"
          onClick={() => ref.current?.scrollBy({ left: ref.current.clientWidth * 0.7, behavior: "smooth" })}
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand-ink shadow-md ring-1 ring-brand-pink/20"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </nav>
  );
}
