import Link from "next/link";
import { MapPin, Truck, MessageCircle } from "lucide-react";
import Reveal from "@/components/Reveal";
import HomeHero from "@/components/HomeHero";
import ProductCard from "@/components/ProductCard";
import CTABand from "@/components/CTABand";
import { getFeaturedProducts } from "@/lib/products";
import { whatsappLink, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/contact";

export const revalidate = 60;

export default async function Home() {
  const featured = await getFeaturedProducts();

  return (
    <>
      <HomeHero />

      <section className="max-w-6xl mx-auto px-5 sm:px-8 mt-20">
        <Reveal className="flex items-end justify-between gap-4">
          <h2 className="font-script text-4xl sm:text-5xl text-brand-ink">Lo más pedido</h2>
          <Link href="/tienda" className="text-sm font-semibold text-brand-pink-dark hover:underline">
            Ver todo →
          </Link>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.05}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 mt-20">
        <div className="grid gap-4 md:grid-cols-2">
          <Reveal>
            <div className="card p-7 h-full">
              <span className="icon-badge"><MapPin size={26} /></span>
              <h3 className="mt-4 text-xl font-semibold text-brand-ink">Entrega gratis en Chimaltenango</h3>
              <p className="mt-2 text-brand-ink/70">
                Pide desde tu celular y recibe tu pedido gratis en un punto de encuentro.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="card p-7 h-full">
              <span className="icon-badge"><Truck size={26} /></span>
              <h3 className="mt-4 text-xl font-semibold text-brand-ink">Envíos a todo el país</h3>
              <p className="mt-2 text-brand-ink/70">
                Llegamos a otros departamentos por paquetería. Coordinamos todo contigo por WhatsApp.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <CTABand
        title="¿Tienes dudas? Escríbenos"
        description="Con gusto te ayudamos a elegir y coordinamos tu entrega."
      >
        <a
          href={whatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp inline-flex items-center gap-2 px-8 py-3.5 font-semibold"
        >
          <MessageCircle size={20} />
          Escribir por WhatsApp
        </a>
      </CTABand>
    </>
  );
}
