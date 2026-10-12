import { Heart } from "lucide-react";

/** Acuarelas, corazones y brillos decorativos del hero (solo adorno). */
export default function HeroDecor() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none [mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)]"
      aria-hidden="true"
    >
      <div className="absolute -bottom-24 -left-24 w-[26rem] h-[18rem] rotate-[-12deg] rounded-[45%_55%_60%_40%] bg-gradient-to-tr from-brand-pink/70 to-brand-lilac/50 blur-2xl" />
      <div className="absolute -bottom-28 -right-20 w-[28rem] h-[18rem] rotate-[10deg] rounded-[55%_45%_40%_60%] bg-gradient-to-tl from-brand-pink/60 to-brand-lilac/60 blur-2xl" />
      <div className="absolute top-10 left-[30%] w-72 h-72 rounded-full bg-brand-lilac/15 blur-3xl" />

      <Heart className="absolute bottom-10 right-[8%] text-brand-pink/60 hidden lg:block" size={34} strokeWidth={1.5} />
      <Heart className="absolute bottom-24 left-[6%] text-brand-lilac/60 hidden lg:block" size={28} strokeWidth={1.5} />
    </div>
  );
}
