import Link from "next/link";
import type { Category } from "@/lib/categories";
import { CATEGORY_ICONS } from "./iconMap";

export default function CategoryCard({ category }: { category: Category }) {
  const Icon = CATEGORY_ICONS[category.id];
  return (
    <Link
      href={`/tienda?categoria=${category.id}`}
      className="card flex flex-col items-center gap-3 p-5 text-center"
    >
      <span className="icon-badge">
        <Icon size={26} />
      </span>
      <span className="font-semibold text-brand-ink">{category.label}</span>
      <span className="text-xs text-brand-ink/60 hidden sm:block">{category.description}</span>
    </Link>
  );
}
