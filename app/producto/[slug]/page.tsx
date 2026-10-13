import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Truck } from "lucide-react";
import ProductGallery from "@/components/ProductGallery";
import ProductBuy from "@/components/ProductBuy";
import ProductCard from "@/components/ProductCard";
import { ProductViewProvider } from "@/components/ProductViewContext";
import { getProduct, getProducts } from "@/lib/products";
import { formatQ } from "@/lib/format";

type Params = Promise<{ slug: string }>;

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product ? `${product.name} — Mia Store` : "Producto — Mia Store" };
}

export default async function ProductoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const all = await getProducts();
  const related = all.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4);

  return (
    <section className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
      <Link href="/tienda" className="inline-flex items-center gap-1 text-sm text-brand-pink-dark hover:underline">
        <ArrowLeft size={16} /> Volver a la tienda
      </Link>

      <ProductViewProvider>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <ProductGallery product={product} />

        <div>
          <span className="text-sm font-medium text-brand-lilac-dark">{product.categoryLabel}</span>
          <h1 className="mt-1 text-3xl sm:text-4xl font-bold text-brand-ink">{product.name}</h1>
          <p className="mt-3 text-3xl font-bold text-brand-pink-dark">{formatQ(product.price)}</p>
          <p className="mt-4 text-brand-ink/70 leading-relaxed">{product.description}</p>

          <ProductBuy product={product} />

          <p className="mt-6 flex items-center gap-2 text-sm text-brand-ink/60">
            <Truck size={16} className="text-brand-pink-dark" />
            Entregas en Chimaltenango y envíos a todo el país.{" "}
            <Link href="/envios" className="text-brand-pink-dark underline">Ver detalles</Link>
          </p>
        </div>
      </div>
      </ProductViewProvider>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-script text-4xl text-brand-ink">También te puede gustar</h2>
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
