import Image from "next/image";
import type { Product } from "@/lib/products";
import { CATEGORY_ICONS } from "./iconMap";

export default function ProductImage({
  product,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
}: {
  product: Product;
  sizes?: string;
}) {
  const Icon = CATEGORY_ICONS[product.category];

  if (product.image) {
    return (
      <Image
        src={product.image}
        alt={product.name}
        fill
        sizes={sizes}
        className="object-cover"
      />
    );
  }

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-pink-light via-white to-brand-lilac-light text-brand-pink"
      role="img"
      aria-label={product.name}
    >
      <Icon size={56} strokeWidth={1.4} />
    </div>
  );
}
