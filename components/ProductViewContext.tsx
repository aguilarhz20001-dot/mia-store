"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";

type View = {
  /** Estilo cuya foto se está viendo en la galería (undefined = fotos generales) */
  previewId?: string;
  setPreviewId: (id?: string) => void;
  /** true en celular: ahí la galería se desliza entre estilos y el estilo que se ve queda listo para agregar */
  swipeMode: boolean;
};

const Ctx = createContext<View>({ previewId: undefined, setPreviewId: () => {}, swipeMode: false });

// Mismo corte que `md:` de Tailwind (768px)
const MOBILE_QUERY = "(max-width: 767.98px)";

function subscribeMobile(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const isMobile = () => window.matchMedia(MOBILE_QUERY).matches;

/**
 * Conecta la galería con el selector de estilos de la página del producto.
 * `initialId` es el estilo con el que se abre la página (el primero que tenga stock).
 */
export function ProductViewProvider({ children, initialId }: { children: ReactNode; initialId?: string }) {
  const [previewId, setPreviewId] = useState<string | undefined>(initialId);
  const swipeMode = useSyncExternalStore(subscribeMobile, isMobile, () => false);
  return <Ctx.Provider value={{ previewId, setPreviewId, swipeMode }}>{children}</Ctx.Provider>;
}

export function useProductView() {
  return useContext(Ctx);
}
