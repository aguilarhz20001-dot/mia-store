import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import Reveal from "@/components/Reveal";
import { DoodleHeart, Sparkle, Dashes } from "@/components/Doodles";
import FacebookIcon from "@/components/icons/FacebookIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { FACEBOOK_URL, INSTAGRAM_URL, whatsappLink, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/contact";

export const metadata = { title: "Contacto — Mia Store" };

const BADGE =
  "grid h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem] shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-pink-light to-white text-[#e9468f] ring-1 ring-brand-pink/25";

export default function ContactoPage() {
  return (
    <div className="relative overflow-hidden pb-20 sm:pb-28">
      {/* Encabezado */}
      <section className="mx-auto grid max-w-6xl items-center gap-4 px-5 pt-10 sm:px-8 sm:pt-14 md:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="relative inline-block font-script text-7xl font-bold leading-[1.05] text-brand-ink sm:text-8xl">
            Hablemos
            <span aria-hidden="true" className="absolute -right-12 -top-1 flex items-start gap-1 sm:-right-24 sm:top-2">
              <Dashes className="h-5 w-5 -scale-x-100 text-brand-pink sm:h-6 sm:w-6" />
              <DoodleHeart className="mt-1 h-6 w-6 rotate-[8deg] text-brand-pink sm:h-8 sm:w-8" />
            </span>
          </h1>
          <p className="mt-4 max-w-md text-xl text-brand-ink/70 sm:text-2xl">
            Estamos aquí para ayudarte con tu compra.
          </p>
        </div>

        <Image
          src="/contacto/caja-mia.webp"
          alt="Caja de regalo rosa de Mia Store con una ramita de lavanda"
          width={1400}
          height={843}
          priority
          sizes="(min-width: 1024px) 26rem, (min-width: 768px) 22rem, 20rem"
          className="mx-auto w-72 md:ml-auto md:mr-0 md:w-[22rem] lg:w-[26rem] md:-mt-4"
        />
      </section>

      {/* Tarjetas principales */}
      <section className="mx-auto mt-10 grid max-w-6xl gap-6 px-5 sm:px-8 md:grid-cols-2 md:gap-8">
        <Reveal>
          <div className="card flex h-full items-start gap-5 p-6 sm:gap-6 sm:p-8">
            <span className={BADGE}>
              <WhatsAppIcon className="h-9 w-9 sm:h-10 sm:w-10" />
            </span>
            <div>
              <h2 className="font-script text-3xl font-semibold text-brand-ink sm:text-4xl">¿Necesitas ayuda?</h2>
              <p className="mt-2 text-brand-ink/70">
                Escríbenos para consultar productos, precios o coordinar tu pedido.
              </p>
              <a
                href={whatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pink mt-5 inline-flex items-center gap-2.5 px-6 py-3.5 font-semibold"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Escribir por WhatsApp
                <ChevronRight size={18} />
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="card flex h-full items-start gap-5 p-6 sm:gap-6 sm:p-8">
            <span className={BADGE}>
              <MapPin className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="font-script text-3xl font-semibold text-brand-ink sm:text-4xl">Entregas y envíos</h2>
              <p className="mt-2 text-brand-ink/70">
                Entrega en Chimaltenango y envíos a toda Guatemala.
              </p>
              <Link
                href="/envios"
                className="mt-5 inline-flex items-center gap-1.5 border-b border-brand-pink pb-0.5 text-sm font-medium text-[#e9468f] hover:text-brand-pink-dark"
              >
                Ver opciones de envío
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Redes */}
      <section className="mx-auto mt-14 max-w-3xl px-5 sm:mt-16 sm:px-8">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <span aria-hidden="true" className="hidden items-center gap-1 sm:flex">
            <Dashes className="h-5 w-5 text-brand-pink" />
            <Sparkle className="h-4 w-4 text-brand-lilac" />
          </span>
          <h2 className="text-center font-script text-3xl font-medium text-brand-ink sm:text-4xl">
            También puedes encontrarnos en
          </h2>
          <span aria-hidden="true" className="hidden items-center gap-1 sm:flex">
            <Sparkle className="h-4 w-4 text-brand-lilac" />
            <Dashes className="h-5 w-5 -scale-x-100 text-brand-pink" />
          </span>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-8">
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="card flex items-center gap-4 px-5 py-4 sm:px-6"
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-pink-light">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#ec4899] text-white">
                <FacebookIcon className="h-6 w-6" />
              </span>
            </span>
            <span className="flex-1 font-script text-2xl font-medium text-brand-ink sm:text-3xl">
              Síguenos en Facebook
            </span>
            <ChevronRight size={18} className="shrink-0 text-[#e9468f]" />
          </a>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="card flex items-center gap-4 px-5 py-4 sm:px-6"
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-pink-light text-[#ec4899]">
              <InstagramIcon className="h-9 w-9" />
            </span>
            <span className="flex-1 font-script text-2xl font-medium text-brand-ink sm:text-3xl">
              Síguenos en Instagram
            </span>
            <ChevronRight size={18} className="shrink-0 text-[#e9468f]" />
          </a>
        </div>
      </section>
    </div>
  );
}
