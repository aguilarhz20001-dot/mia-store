/**
 * Fondo global de Mia Store: acuarela rosa y lila fija en la pantalla,
 * con ondas blancas en las esquinas de abajo.
 * Los garabatos (corazones, brillos, lavanda) se repiten por toda la página
 * con la clase `.site-doodles` (ver globals.css y public/fondo/garabatos.svg).
 */
export default function SiteBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-24 -left-28 h-[26rem] w-[34rem] rotate-[-8deg] rounded-[55%_45%_62%_38%] bg-gradient-to-br from-brand-pink/40 via-brand-pink/18 to-transparent blur-3xl" />
      <div className="absolute -top-16 -right-24 h-[28rem] w-[36rem] rotate-[10deg] rounded-[45%_55%_40%_60%] bg-gradient-to-bl from-brand-lilac/40 via-brand-pink/18 to-transparent blur-3xl" />
      <div className="absolute -bottom-20 -left-24 h-72 w-[26rem] rotate-[-10deg] rounded-[50%_50%_40%_60%] bg-gradient-to-tr from-brand-pink/50 to-brand-lilac/35 blur-2xl" />
      <div className="absolute -bottom-24 -right-20 h-72 w-[28rem] rotate-[8deg] rounded-[55%_45%_60%_40%] bg-gradient-to-tl from-brand-pink/45 to-brand-lilac/45 blur-2xl" />

      <svg
        viewBox="0 0 300 120"
        fill="none"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="absolute bottom-0 left-0 hidden h-28 w-72 opacity-80 sm:block"
      >
        <path d="M0 80C60 70 110 95 170 120" />
        <path d="M0 60C70 55 130 85 210 120" />
      </svg>
      <svg
        viewBox="0 0 300 120"
        fill="none"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="absolute bottom-0 right-0 hidden h-28 w-72 -scale-x-100 opacity-80 sm:block"
      >
        <path d="M0 80C60 70 110 95 170 120" />
        <path d="M0 60C70 55 130 85 210 120" />
      </svg>
    </div>
  );
}
