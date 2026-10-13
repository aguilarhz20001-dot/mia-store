import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Heart, MessageCircle, ShoppingBag, Sparkle } from "lucide-react";
import Reveal from "./Reveal";
import HeroDecor from "./HeroDecor";
import TrustBar from "./TrustBar";
import { whatsappLink, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/contact";

function SidePanel({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative rounded-3xl bg-white p-1.5 shadow-lg shadow-brand-pink/25 ring-1 ring-brand-pink/20 ${className}`}>
      <div className="relative w-full h-full overflow-hidden rounded-[1.25rem]">
        <Image src={src} alt={alt} fill sizes="22vw" className="object-cover" />
      </div>
    </div>
  );
}

/** Tarjeta principal para celular y tablet: título, botones y escaparate de productos. */
function MobileHero() {
  return (
    <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-white via-brand-pink-light to-brand-lilac-light p-5 pb-6 min-h-[340px] shadow-lg shadow-brand-pink/20 ring-1 ring-brand-pink/20">
      <Heart className="absolute left-3 top-4 h-5 w-5 -rotate-12 text-brand-pink/70" strokeWidth={1.6} aria-hidden="true" />
      <Heart className="absolute right-4 top-4 h-6 w-6 rotate-12 text-brand-lilac/70" strokeWidth={1.6} aria-hidden="true" />
      <Sparkle className="absolute left-[44%] top-[44%] h-3.5 w-3.5 text-brand-lilac/70" aria-hidden="true" />

      <Image
        src="/hero-escaparate.webp"
        alt="Ropa, calzado, bolsos y belleza de Mia Store"
        width={800}
        height={734}
        sizes="(min-width: 640px) 22rem, 60vw"
        className="pointer-events-none absolute -right-[7%] bottom-0 -z-10 h-auto w-[62%] drop-shadow-xl"
      />

      <h1 className="font-script font-bold leading-none">
        <span className="block pl-1 text-[clamp(1.4rem,7vw,2rem)] text-brand-ink">Tu tienda en</span>
        <span className="block whitespace-nowrap text-[clamp(2.1rem,10.6vw,3.4rem)] text-brand-pink-dark">
          Chimaltenango
        </span>
      </h1>

      <p className="mt-3 w-[50%] text-[13px] leading-snug text-brand-ink/80">
        Ropa, accesorios, calzado, belleza y muchas cositas más.
      </p>

      <div className="mt-4 flex w-[48%] flex-col gap-2">
        <Link
          href="/tienda"
          className="btn-primary inline-flex items-center justify-center gap-1.5 px-3 py-3 text-[13px] font-semibold"
        >
          Ver productos
          <ArrowRight size={15} />
        </Link>
        <a
          href={whatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline inline-flex items-center justify-center gap-1.5 px-3 py-3 text-[13px] font-semibold !bg-white"
        >
          <MessageCircle size={16} className="shrink-0 text-[#25D366]" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      <HeroDecor />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-4 lg:pt-8 lg:pb-14">
        {/* ---------- Celular y tablet ---------- */}
        <div className="mx-auto max-w-xl lg:hidden">
          <MobileHero />
          <div className="mt-4">
            <TrustBar compact />
          </div>
        </div>

        {/* ---------- Escritorio (sin cambios): foto | centro | foto ---------- */}
        <div className="hidden lg:block">
          <div className="grid items-stretch gap-6 grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)_minmax(0,1fr)]">
            <Reveal y={20}>
              <SidePanel src="/hero-izquierda.jpg" alt="Ropa, calzado y bolsos" className="h-full min-h-[640px]" />
            </Reveal>

            <div className="flex flex-col items-center text-center">
              <Reveal className="w-full">
                <Image
                  src="/banner.png"
                  alt="Mia Store — Todo lo que te gusta… en un solo lugar"
                  width={2056}
                  height={765}
                  sizes="(min-width: 1280px) 52vw, 50vw"
                  className="w-full h-auto rounded-3xl shadow-lg shadow-brand-pink/25 ring-1 ring-brand-pink/20"
                />
              </Reveal>

              <Reveal delay={0.1} className="w-full mt-8">
                <h1 className="sr-only">Mia Store: tu tienda en línea</h1>
                <Image
                  src="/hero-titulo-limpio.png"
                  alt="Tu tienda en Chimaltenango. Ropa, accesorios, calzado, belleza y muchas cositas más."
                  width={1600}
                  height={566}
                  sizes="42rem"
                  className="w-full max-w-2xl h-auto mx-auto"
                />

                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  <Link href="/tienda" className="btn-primary inline-flex items-center gap-3 px-8 py-4 font-semibold">
                    <ShoppingBag size={20} />
                    Ver productos
                    <ChevronRight size={18} />
                  </Link>
                  <a
                    href={whatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline inline-flex items-center gap-3 px-8 py-4 font-semibold !bg-white"
                  >
                    <MessageCircle size={20} className="text-[#25D366]" />
                    Escríbenos por WhatsApp
                    <ChevronRight size={18} />
                  </a>
                </div>
              </Reveal>
            </div>

            <Reveal y={20} delay={0.08}>
              <SidePanel src="/hero-derecha.jpg" alt="Belleza y accesorios" className="h-full min-h-[640px]" />
            </Reveal>
          </div>

          <div className="mt-12">
            <TrustBar />
          </div>
        </div>
      </div>
    </section>
  );
}
