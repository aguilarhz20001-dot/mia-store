import { Truck, ShieldCheck, Heart, Star } from "lucide-react";
import Reveal from "./Reveal";

const ITEMS = [
  { icon: Truck, label: "Envíos a todo el país" },
  { icon: ShieldCheck, label: "Compra segura" },
  { icon: Heart, label: "Variedad de productos" },
  { icon: Star, label: "Calidad garantizada" },
];

/**
 * `compact`: versión miniatura 2×2 para meter bajo los botones, en el centro del hero (celular).
 * Sin `compact`: fila de cuatro con separadores (pantallas grandes).
 */
export default function TrustBar({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Reveal delay={0.15}>
        <ul className="grid grid-cols-2 gap-2">
          {ITEMS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex flex-col items-center justify-start gap-1 rounded-xl bg-white/80 px-1.5 py-2 text-center shadow-sm shadow-brand-pink/15 ring-1 ring-brand-pink/20"
            >
              <span className="icon-badge !h-8 !w-8">
                <Icon className="h-4 w-4" strokeWidth={1.7} />
              </span>
              <span className="text-[10.5px] font-medium leading-tight text-brand-ink/80 text-balance">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    );
  }

  return (
    <Reveal>
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-0 max-w-4xl mx-auto">
        {ITEMS.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex flex-col items-center justify-start gap-2 rounded-2xl bg-white/75 px-3 py-4 text-center shadow-sm shadow-brand-pink/15 ring-1 ring-brand-pink/20 md:rounded-none md:bg-transparent md:px-4 md:py-0 md:shadow-none md:ring-0 md:border-l md:border-brand-pink/30 md:first:border-l-0"
          >
            <span className="icon-badge !h-11 !w-11 md:!h-14 md:!w-14">
              <Icon className="h-5 w-5 md:h-[26px] md:w-[26px]" strokeWidth={1.6} />
            </span>
            <span className="max-w-[9rem] text-[13px] font-medium leading-snug text-brand-ink/80 text-balance md:max-w-[8rem] md:text-sm">
              {label}
            </span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
