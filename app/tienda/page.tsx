import { Flame } from "lucide-react";
import ShopBanner from "@/components/tienda/ShopBanner";
import CategoryMenu from "@/components/tienda/CategoryMenu";
import ShopProductCard from "@/components/tienda/ShopProductCard";
import { getCategoryIcon } from "@/components/iconMap";
import { findCategory, getCategories } from "@/lib/categories";
import { getProductsByCategory } from "@/lib/products";

export const metadata = { title: "Tienda — Mia Store" };

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const categories = await getCategories();
  const active = categoria ? findCategory(categories, categoria) : undefined;
  const products = await getProductsByCategory(active?.id);

  const HeadingIcon = active ? getCategoryIcon(active.icon) : Flame;

  return (
    <>
      <h1 className="sr-only">Tienda Mia Store</h1>

      <section className="mx-auto max-w-6xl px-4 pt-4 sm:px-8 sm:pt-6">
        <ShopBanner />
      </section>

      <section id="productos" className="mx-auto mt-6 max-w-6xl scroll-mt-24 px-4 pb-14 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-pink-light text-[#dc3a8a]">
            <HeadingIcon size={22} aria-hidden="true" />
          </span>
          <h2 className="min-w-0 truncate text-xl font-bold text-brand-ink sm:text-2xl">{active ? active.label : "Más populares"}</h2>
          <span className="h-px flex-1 bg-gradient-to-r from-brand-pink/60 to-transparent" aria-hidden="true" />
          <CategoryMenu categories={categories} activeId={active?.id} />
        </div>
        {active && <p className="mt-2 text-sm text-brand-ink/70">{active.description}</p>}

        {products.length === 0 ? (
          <p className="mt-8 rounded-3xl bg-white/80 p-8 text-center text-brand-ink/70 ring-1 ring-brand-pink/20">
            Pronto tendremos productos en esta categoría.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ShopProductCard
                key={p.slug}
                product={p}
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
