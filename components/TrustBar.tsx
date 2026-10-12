import { Truck, ShieldCheck, Heart, Star } from "lucide-react";
import Reveal from "./Reveal";

const ITEMS = [
  { icon: Truck, label: "Envíos a todo el país" },
  { icon: ShieldCheck, label: "Compra segura" },
  { icon: Heart, label: "Variedad de productos" },
  { icon: Star, label: "Calidad garantizada" },
];

export default function TrustBar() {
  return (
    <Reveal>
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-y-6 max-w-4xl mx-auto">
        {ITEMS.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex flex-col items-center gap-2 px-4 text-center md:border-l md:border-brand-pink/30 md:first:border-l-0"
          >
            <span className="icon-badge">
              <Icon size={26} strokeWidth={1.6} />
            </span>
            <span className="text-sm font-medium text-brand-ink/80 max-w-[8rem]">{label}</span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
