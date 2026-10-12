import Reveal from "./Reveal";

export default function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-18">
        <Reveal className="max-w-2xl">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-pink-dark bg-white px-3 py-1.5 rounded-full shadow-sm">
              {eyebrow}
            </span>
          )}
          <h1 className={`${eyebrow ? "mt-5" : ""} font-script text-5xl sm:text-6xl text-brand-ink`}>
            {title}
          </h1>
          <p className="mt-4 text-lg text-brand-ink/70 leading-relaxed">{description}</p>
        </Reveal>
      </div>
    </section>
  );
}
