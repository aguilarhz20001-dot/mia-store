/**
 * Garabatos decorativos al estilo "dibujado a mano": corazones, brillos y líneas.
 * Todos usan `currentColor` para que el color se controle con clases de Tailwind.
 */

type P = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function DoodleHeart({ className }: P) {
  return (
    <svg viewBox="0 0 64 60" className={className} {...base} strokeWidth={3}>
      <path d="M32 55C13 41 4 30 6 19C8 8 21 3 28 12C30 14.5 31 16 32 18C34 13 39 7 47 7C57 6 62 16 58 26C55 36 44 46 32 55Z" />
    </svg>
  );
}

export function Sparkle({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={1.6}>
      <path d="M12 1C12.8 7.5 16.5 11.2 23 12C16.5 12.8 12.8 16.5 12 23C11.2 16.5 7.5 12.8 1 12C7.5 11.2 11.2 7.5 12 1Z" />
    </svg>
  );
}

/** Tres rayitas que salen de un punto, como "¡ta-dá!". Se refleja con `-scale-x-100`. */
export function Dashes({ className }: P) {
  return (
    <svg viewBox="0 0 28 22" className={className} {...base} strokeWidth={2.4}>
      <path d="M4 3L10 8M2 12H10M4 21L10 16" />
    </svg>
  );
}

/** Corazón punteado con una estela que termina en un avioncito de papel. */
export function PlaneTrail({ className }: P) {
  return (
    <svg viewBox="0 0 230 160" className={className} {...base} strokeWidth={2.4}>
      <path
        strokeDasharray="2 9"
        d="M60 150C28 124 8 102 12 80C16 58 44 52 58 74C62 80 64 84 66 88C70 76 82 64 98 66C116 68 122 92 108 112C98 126 80 140 60 150Z"
      />
      <path strokeDasharray="2 9" d="M104 66C120 30 150 62 172 34" />
      <path d="M176 30L212 14L196 52L188 38Z" />
      <path d="M188 38L212 14" />
    </svg>
  );
}

/** Línea fina con un corazón en el centro. */
export function HeartDivider({ className = "" }: P) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-24 sm:w-44 bg-gradient-to-r from-transparent to-brand-pink/70" />
      <DoodleHeart className="h-5 w-5 text-brand-pink" />
      <span className="h-px w-24 sm:w-44 bg-gradient-to-l from-transparent to-brand-pink/70" />
    </div>
  );
}
