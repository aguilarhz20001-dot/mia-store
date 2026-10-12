import type { ReactNode } from "react";
import Reveal from "./Reveal";

export default function CTABand({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-brand-pink to-brand-lilac text-white mt-20">
      <Reveal className="relative max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20 text-center">
        <h2 className="font-script text-4xl sm:text-5xl">{title}</h2>
        <p className="mt-3 text-white/90 max-w-xl mx-auto text-lg">{description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">{children}</div>
      </Reveal>
    </section>
  );
}
