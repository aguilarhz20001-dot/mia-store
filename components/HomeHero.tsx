import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MessageCircle, ShoppingBag } from "lucide-react";
import Reveal from "./Reveal";
import HeroDecor from "./HeroDecor";
import TrustBar from "./TrustBar";
import { whatsappLink, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/contact";

function SidePanel({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative rounded-2xl sm:rounded-3xl bg-white p-1 sm:p-1.5 shadow-lg shadow-brand-pink/25 ring-1 ring-brand-pink/20 ${className}`}>
      <div className="relative w-full h-full overflow-hidden rounded-xl sm:rounded-[1.25rem]">
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 22vw, 24vw" className="object-cover" priority />
      </div>
    </div>
  );
}

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      <HeroDecor />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-8 pt-6 sm:pt-8 pb-2 sm:pb-14">
        {/* Siempre tres columnas: foto | centro | foto (también en celular) */}
        <div className="grid items-stretch gap-2 sm:gap-4 lg:gap-6 grid-cols-[minmax(0,0.8fr)_minmax(0,2.4fr)_minmax(0,0.8fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)_minmax(0,1fr)]">
          <Reveal y={20}>
            <SidePanel src="/hero-izquierda.jpg" alt="Ropa, calzado y bolsos" className="h-full min-h-[460px] sm:min-h-[560px] lg:min-h-[640px]" />
          </Reveal>

          <div className="flex flex-col items-center text-center min-w-0">
            <Reveal className="w-full">
              <Image
                src="/banner.png"
                alt="Mia Store — Todo lo que te gusta… en un solo lugar"
                width={2056}
                height={765}
                priority
                sizes="(min-width: 1280px) 52vw, (min-width: 1024px) 50vw, 60vw"
                className="w-full h-auto rounded-2xl sm:rounded-3xl shadow-lg shadow-brand-pink/25 ring-1 ring-brand-pink/20"
              />
            </Reveal>

            <Reveal delay={0.1} className="w-full mt-5 sm:mt-8">
              <h1 className="sr-only">Mia Store: tu tienda en línea</h1>
              <Image
                src="/hero-titulo-limpio.png"
                alt=""
                width={1580}
                height={546}
                sizes="(min-width: 672px) 42rem, 60vw"
                className="w-full max-w-2xl h-auto mx-auto"
              />
              <p className="sr-only">Ropa, accesorios, calzado, belleza y muchas cositas más.</p>

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-2 sm:gap-4">
                <Link
                  href="/tienda"
                  className="btn-primary inline-flex items-center justify-center gap-1.5 sm:gap-3 px-3 py-3 text-[13px] sm:px-8 sm:py-4 sm:text-base font-semibold"
                >
                  <ShoppingBag className="hidden sm:block" size={20} />
                  Ver productos
                  <ChevronRight className="hidden sm:block" size={18} />
                </Link>
                <a
                  href={whatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline inline-flex items-center justify-center gap-1.5 sm:gap-3 px-3 py-3 text-[13px] sm:px-8 sm:py-4 sm:text-base font-semibold !bg-white"
                >
                  <MessageCircle size={18} className="text-[#25D366] shrink-0" />
                  <span className="sm:hidden">WhatsApp</span>
                  <span className="hidden sm:inline">Escríbenos por WhatsApp</span>
                  <ChevronRight className="hidden sm:block" size={18} />
                </a>
              </div>
            </Reveal>

            {/* Solo celular: aprovecha el espacio libre bajo los botones */}
            <div className="mt-4 w-full sm:hidden">
              <TrustBar compact />
            </div>
          </div>

          <Reveal y={20} delay={0.08}>
            <SidePanel src="/hero-derecha.jpg" alt="Belleza y accesorios" className="h-full min-h-[460px] sm:min-h-[560px] lg:min-h-[640px]" />
          </Reveal>
        </div>

        <div className="mt-12 hidden sm:block">
          <TrustBar />
        </div>
      </div>
    </section>
  );
}
