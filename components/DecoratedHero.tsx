import type { ReactNode } from "react";
import {
  DoodleHeart,
  Sparkle,
  Dashes,
  PlaneTrail,
  HeartDivider,
} from "./Doodles";

/** Un respiro claro detrás del título para que se lea bien sobre el fondo global. */
function Watercolor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-[42%] h-64 w-[44rem] max-w-full -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />
    </div>
  );
}

function SideDecor({ variant }: { variant: "tienda" | "envios" }) {
  if (variant === "envios") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden sm:block">
        <PlaneTrail className="absolute left-[5%] top-[10%] w-40 lg:w-52 text-brand-pink" />
        <Sparkle className="absolute left-[4%] top-[58%] h-6 w-6 text-brand-lilac" />
        <Sparkle className="absolute left-[16%] top-[74%] hidden h-7 w-7 text-brand-lilac lg:block" />
        <Sparkle className="absolute right-[9%] top-[14%] h-7 w-7 text-brand-lilac" />
        <DoodleHeart className="absolute right-[6%] top-[28%] h-12 w-12 rotate-[8deg] text-brand-pink" />
        <Sparkle className="absolute right-[3%] top-[62%] h-6 w-6 text-brand-lilac" />
      </div>
    );
  }
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <DoodleHeart className="absolute left-[5%] top-[3%] h-7 w-7 sm:left-[4%] sm:top-[18%] sm:h-10 sm:w-10 -rotate-[10deg] text-brand-pink/80" />
      <DoodleHeart className="absolute left-[12%] top-[48%] hidden h-5 w-5 text-brand-lilac sm:block" />
      <Sparkle className="absolute left-[8%] top-[72%] hidden h-6 w-6 text-brand-lilac sm:block" />
      <DoodleHeart className="absolute right-[5%] top-[6%] h-7 w-7 sm:right-[4%] sm:top-[26%] sm:h-10 sm:w-10 rotate-[8deg] text-brand-pink/80" />
      <Sparkle className="absolute right-[11%] top-[10%] hidden h-6 w-6 text-brand-lilac sm:block" />
      <DoodleHeart className="absolute right-[13%] top-[62%] hidden h-5 w-5 text-brand-pink sm:block" />
    </div>
  );
}

/**
 * Encabezado centrado con fondo de acuarela, corazones y brillos.
 * `title` acepta JSX para poder resaltar parte del texto.
 */
export default function DecoratedHero({
  title,
  description,
  pill,
  variant = "tienda",
}: {
  title: ReactNode;
  description: string;
  /** Etiqueta en forma de pastilla debajo de la línea con corazón */
  pill?: string;
  variant?: "tienda" | "envios";
}) {
  return (
    <section className="relative isolate overflow-hidden">
      <Watercolor />
      <SideDecor variant={variant} />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8 pt-12 pb-8 sm:pt-16 text-center">
        <h1 className="font-script font-bold text-5xl sm:text-6xl md:text-7xl leading-[1.08] text-brand-ink">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg sm:text-xl text-brand-ink/75">{description}</p>
        <HeartDivider className="mt-6" />

        {pill && (
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full bg-brand-lilac-light/90 px-5 sm:px-8 py-2 ring-1 ring-brand-lilac/25">
              <Dashes className="h-4 w-5 text-brand-pink" />
              <DoodleHeart className="h-5 w-5 text-brand-pink-dark" />
              <span className="font-script text-2xl text-brand-lilac-dark">{pill}</span>
              <Dashes className="h-4 w-5 -scale-x-100 text-brand-pink" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
