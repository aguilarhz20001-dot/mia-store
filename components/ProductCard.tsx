import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatQ } from "@/lib/format";
import ProductImage from "./ProductImage";

export default function ProductCard({ product, sizes }: { product: Product; sizes?: string }) {
  return (
    <Link
      href={`/producto/${product.slug}`}
      className="card group flex flex-col overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden">
        <ProductImage product={product} sizes={sizes} />
        {product.inStock === false && (
          <span className="absolute top-3 right-3 rounded-full bg-brand-ink/80 text-white text-xs font-semibold px-3 py-1">
            Agotado
          </span>
        )}
        {product.badge && (
          <span className="absolute top-3 left-3 rounded-full bg-brand-pink-dark text-white text-xs font-semibold px-3 py-1">
            {product.badge}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1">
        {product.categoryLabel && (
          <span className="w-fit rounded-full bg-brand-lilac-light px-2.5 py-0.5 text-xs font-medium text-brand-lilac-dark">
            {product.categoryLabel}
          </span>
        )}
        <h3 className="font-semibold text-brand-ink leading-snug">{product.name}</h3>
        <p className="mt-1 text-lg font-bold text-brand-pink-dark">{formatQ(product.price)}</p>
        <span className="mt-2 rounded-full bg-brand-pink-dark py-2 text-center text-sm font-semibold text-white lg:hidden">
          Ver más
        </span>
      </div>
    </Link>
  );
}
