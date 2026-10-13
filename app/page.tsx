import Image from "next/image";
import Link from "next/link";
import { MapPin, Truck, MessageCircle, Sparkles } from "lucide-react";
import Reveal from "@/components/Reveal";
import HomeHero from "@/components/HomeHero";
import ProductCard from "@/components/ProductCard";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import CTABand from "@/components/CTABand";
import { getFeaturedProducts } from "@/lib/products";
import { whatsappLink, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/contact";

export const revalidate = 60;

export default async function Home() {
  const featured = await getFeaturedProducts();

  return (
    <>
      <HomeHero />

      <section className="max-w-6xl mx-auto px-5 sm:px-8 mt-8 lg:mt-20">
        <Reveal className="flex items-end justify-between gap-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-brand-ink lg:hidden">
            <Sparkles size={22} className="text-brand-pink-dark" aria-hidden="true" />
            Productos destacados
          </h2>
          <h2 className="hidden lg:block font-script text-5xl text-brand-ink">Lo más pedido</h2>
          <Link href="/tienda" className="text-sm font-semibold text-brand-pink-dark hover:underline">
            Ver todos →
          </Link>
        </Reveal>
        <div className="mt-5 lg:mt-8">
          <FeaturedCarousel>
            {featured.map((p) => (
              <div
                key={p.slug}
                className="w-[66%] max-w-[16rem] shrink-0 snap-start sm:w-[44%] sm:max-w-none lg:w-auto"
              >
                <ProductCard
                  product={p}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 44vw, 66vw"
                />
              </div>
            ))}
          </FeaturedCarousel>
        </div>
      </section>

      {/* Banner horizontal (solo celular y tablet) */}
      <section className="mx-auto mt-8 max-w-xl px-5 sm:px-8 lg:hidden">
        <Reveal>
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-white via-brand-pink-light to-brand-lilac-light p-2 shadow-lg shadow-brand-pink/15 ring-1 ring-brand-pink/20">
            <Image
              src="/banner-belleza-rosa.webp"
              alt="Belleza, estilo y todo lo que te gusta — Mia Store"
              width={1200}
              height={332}
              sizes="(min-width: 576px) 36rem, 100vw"
              className="h-auto w-full"
            />
          </div>
        </Reveal>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 mt-14 md:mt-20">
        <div className="grid gap-3 md:gap-4 md:grid-cols-2">
          <Reveal>
            <div className="card flex items-start gap-4 p-4 md:block md:p-7 h-full">
              <span className="icon-badge !h-11 !w-11 md:!h-14 md:!w-14">
                <MapPin className="h-5 w-5 md:h-[26px] md:w-[26px]" />
              </span>
              <div className="min-w-0">
                <h3 className="text-base md:mt-4 md:text-xl font-semibold leading-snug text-brand-ink">
                  Entrega gratis en Chimaltenango
                </h3>
                <p className="mt-1 text-sm md:mt-2 md:text-base text-brand-ink/70">
                  Pide desde tu celular y recibe tu pedido gratis en un punto de encuentro.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="card flex items-start gap-4 p-4 md:block md:p-7 h-full">
              <span className="icon-badge !h-11 !w-11 md:!h-14 md:!w-14">
                <Truck className="h-5 w-5 md:h-[26px] md:w-[26px]" />
              </span>
              <div className="min-w-0">
                <h3 className="text-base md:mt-4 md:text-xl font-semibold leading-snug text-brand-ink">
                  Envíos a todo el país
                </h3>
                <p className="mt-1 text-sm md:mt-2 md:text-base text-brand-ink/70">
                  Llegamos a otros departamentos por paquetería. Coordinamos todo contigo por WhatsApp.
                </p>
              </div>
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
