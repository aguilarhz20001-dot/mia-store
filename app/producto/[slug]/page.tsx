import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Truck } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import ProductBuy from "@/components/ProductBuy";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS, getProduct } from "@/lib/products";
import { getCategory } from "@/lib/categories";
import { formatQ } from "@/lib/format";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  return { title: product ? `${product.name} — Mia Store` : "Producto — Mia Store" };
}

export default async function ProductoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = getCategory(product.category);
  const related = PRODUCTS.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4);

  return (
    <section className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
      <Link href="/tienda" className="inline-flex items-center gap-1 text-sm text-brand-pink-dark hover:underline">
        <ArrowLeft size={16} /> Volver a la tienda
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="card relative aspect-square overflow-hidden">
          <ProductImage product={product} sizes="(min-width: 768px) 50vw, 100vw" />
        </div>

        <div>
          <span className="text-sm font-medium text-brand-lilac-dark">{category?.label}</span>
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
