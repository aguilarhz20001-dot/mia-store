import PageHero from "@/components/PageHero";
import CartView from "@/components/CartView";

export const metadata = { title: "Mi carrito — Mia Store" };

export default function CarritoPage() {
  return (
    <>
      <PageHero
        eyebrow="Carrito"
        title="Tu pedido"
        description="Revisa tus productos, elige cómo recibirlos y envíanos tu pedido por WhatsApp."
      />
      <section className="max-w-6xl mx-auto px-5 sm:px-8 mt-10">
        <CartView />
      </section>
    </>
  );
}
