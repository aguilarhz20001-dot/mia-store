import Image from "next/image";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  /** Etiqueta tipo pincelada: "¡Gratis!", "Q35.00", "Próximamente"… */
  tag: string;
  tagTone?: "pink" | "lilac";
  title: string;
  description: string;
  image: { src: string; width: number; height: number };
  action: ReactNode;
};

const TAG_TONES = {
  pink: "from-brand-pink to-brand-pink-dark shadow-brand-pink/30",
  lilac: "from-brand-lilac to-brand-lilac-dark shadow-brand-lilac/30",
} as const;

export default function DeliveryCard({
  icon: Icon,
  tag,
  tagTone = "pink",
  title,
  description,
  image,
  action,
}: Props) {
  return (
    <article className="card flex h-full flex-col p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="icon-badge">
          <Icon size={26} />
        </span>
        <span
          className={`inline-block -rotate-3 rounded-[0.5rem_1.1rem_0.6rem_1.3rem] bg-gradient-to-r px-5 py-0.5 font-script text-2xl font-bold text-white shadow-md ${TAG_TONES[tagTone]}`}
        >
          {tag}
        </span>
      </div>

      {/* Texto a la izquierda, ilustración a la derecha (debajo del texto en celulares) */}
      <div className="mt-4 grid items-center gap-x-3 gap-y-4 sm:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-balance font-script text-3xl font-bold leading-tight text-brand-ink">{title}</h2>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-brand-ink/75">{description}</p>
        </div>
        <Image
          src={image.src}
          alt=""
          width={image.width}
          height={image.height}
          sizes="(min-width: 1536px) 176px, (min-width: 1280px) 144px, 224px"
          className="mx-auto h-auto w-44 sm:mx-0 sm:w-48 xl:w-36 2xl:w-44"
        />
      </div>

      <div className="mt-auto pt-5">{action}</div>
    </article>
  );
}
