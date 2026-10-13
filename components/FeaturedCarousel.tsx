"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

/**
 * Carrusel horizontal con "snap" para celular y tablet (con flecha y puntitos).
 * En escritorio (lg) se convierte en una cuadrícula de 4 columnas.
 * Cada hijo directo es una "diapositiva".
 */
export default function FeaturedCarousel({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const slides = () => Array.from(el.children) as HTMLElement[];
    setTotal(slides().length);

    const onScroll = () => {
      const kids = slides();
      if (!kids.length) return;
      const origin = kids[0].offsetLeft;
      let best = 0;
      let bestDist = Infinity;
      kids.forEach((k, i) => {
        const d = Math.abs(k.offsetLeft - origin - el.scrollLeft);
        if (d < bestDist) {
          best = i;
          bestDist = d;
        }
      });
      setActive(best);
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const goNext = () => {
    const el = ref.current;
    if (!el) return;
    const kids = Array.from(el.children) as HTMLElement[];
    const next = kids[Math.min(active + 1, kids.length - 1)];
    el.scrollTo({ left: next.offsetLeft - kids[0].offsetLeft, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        className="relative -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {children}
      </div>

      {total > 1 && active < total - 1 && (
        <button
          type="button"
          onClick={goNext}
          aria-label="Ver siguiente producto"
          className="absolute right-0 top-[32%] flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-pink-dark shadow-md ring-1 ring-brand-pink/20 lg:hidden"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {total > 1 && (
        <div className="mt-2 flex justify-center gap-1.5 lg:hidden" aria-hidden="true">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === active ? "w-5 bg-brand-pink-dark" : "w-2 bg-brand-pink/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
