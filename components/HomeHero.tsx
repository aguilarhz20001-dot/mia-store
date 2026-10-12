import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MessageCircle, ShoppingBag } from "lucide-react";
import Reveal from "./Reveal";
import HeroDecor from "./HeroDecor";
import TrustBar from "./TrustBar";
import { whatsappLink, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/contact";

function SidePanel({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative rounded-3xl bg-white p-1.5 shadow-lg shadow-brand-pink/25 ring-1 ring-brand-pink/20 ${className}`}>
      <div className="relative w-full h-full overflow-hidden rounded-[1.25rem]">
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 22vw, 50vw" className="object-cover" priority />
      </div>
    </div>
  );
}

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      <HeroDecor />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-14">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)_minmax(0,1fr)] lg:items-stretch">
          <Reveal className="hidden lg:block" y={20}>
            <SidePanel src="/hero-izquierda.jpg" alt="Ropa, calzado y bolsos" className="h-full min-h-[640px]" />
          </Reveal>

          <div className="flex flex-col items-center text-center">
            <Reveal className="w-full">
              <Image
                src="/banner.png"
                alt="Mia Store — Todo lo que te gusta… en un solo lugar"
                width={2056}
                height={765}
                priority
                className="w-full h-auto rounded-3xl shadow-lg shadow-brand-pink/25 ring-1 ring-brand-pink/20"
              />
            </Reveal>

            <Reveal delay={0.1} className="w-full mt-8">
              <h1 className="sr-only">Mia Store: tu tienda en línea</h1>
              <Image
                src="/hero-titulo.png"
                alt=""
                width={1580}
                height={546}
                className="w-full max-w-2xl h-auto mx-auto"
              />
              <p className="sr-only">Ropa, accesorios, calzado, belleza y muchas cositas más.</p>

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

          <Reveal className="hidden lg:block" y={20} delay={0.08}>
            <SidePanel src="/hero-derecha.jpg" alt="Belleza y accesorios" className="h-full min-h-[640px]" />
          </Reveal>
        </div>

        {/* En pantallas pequeñas los paneles pasan debajo, lado a lado */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:hidden">
          <SidePanel src="/hero-izquierda.jpg" alt="Ropa, calzado y bolsos" className="aspect-[2/3]" />
          <SidePanel src="/hero-derecha.jpg" alt="Belleza y accesorios" className="aspect-[2/3]" />
        </div>

        <div className="mt-12">
          <TrustBar />
        </div>
      </div>
    </section>
  );
}
