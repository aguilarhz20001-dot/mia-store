import Link from "next/link";
import DecoratedHero from "@/components/DecoratedHero";
import ProductCard from "@/components/ProductCard";
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

  return (
    <>
      <DecoratedHero
        title={active ? active.label : "Todos los productos"}
        description={active ? active.description : "Ropa, accesorios, calzado, belleza y mucho más."}
        pill="Encuentra tus favoritos"
      />

      <section className="max-w-6xl mx-auto px-5 sm:px-8 mt-4">
        <div className="flex flex-wrap gap-2">
          <Link href="/tienda" data-active={!active} className="chip">Todo</Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/tienda?categoria=${c.id}`} data-active={active?.id === c.id} className="chip">
              {c.label}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="mt-10 text-brand-ink/70">Pronto tendremos productos en esta categoría.</p>
        ) : (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
