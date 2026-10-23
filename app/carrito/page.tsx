import PageHero from "@/components/PageHero";
import CartView from "@/components/CartView";
import { getAllProducts } from "@/lib/products";

export const metadata = { title: "Mi carrito — Mia Store" };
export const revalidate = 60;

export default async function CarritoPage() {
  // Con todos los productos (también agotados) para que el carrito de alguien nunca pierda un artículo
  const products = await getAllProducts();

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
