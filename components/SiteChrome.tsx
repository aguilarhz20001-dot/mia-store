"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Muestra la cabecera, el pie y el fondo de la tienda, menos en el panel /admin. */
export default function SiteChrome({
  backdrop,
  navbar,
  footer,
  floating,
  children,
}: {
  backdrop: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
  floating: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      {backdrop}
      {navbar}
      <main className="relative flex-1">
        <div aria-hidden="true" className="site-doodles" />
        {children}
      </main>
      {footer}
      {floating}
    </>
  );
}
