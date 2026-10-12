import PageHero from "@/components/PageHero";
import CartView from "@/components/CartView";
import { getProducts } from "@/lib/products";

export const metadata = { title: "Mi carrito — Mia Store" };
export const revalidate = 60;

export default async function CarritoPage() {
  const products = await getProducts();

  return (
    <>
      <PageHero
        eyebrow="Carrito"
        title="Tu pedido"
        description="Revisa tus productos, elige cómo recibirlos y envíanos tu pedido por WhatsApp."
      />
      <section className="max-w-6xl mx-auto px-5 sm:px-8 mt-10">
        <CartView products={products} />
      </section>
    </>
  );
}
