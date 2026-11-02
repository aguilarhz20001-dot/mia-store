"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type View = {
  /** Estilo cuya foto se está viendo en la galería (undefined = fotos generales) */
  previewId?: string;
  setPreviewId: (id?: string) => void;
};

const Ctx = createContext<View>({ previewId: undefined, setPreviewId: () => {} });

/**
 * Conecta la galería con el selector de estilos de la página del producto.
 * `initialId` es el estilo con el que se abre la página (el primero que tenga stock).
 */
export function ProductViewProvider({ children, initialId }: { children: ReactNode; initialId?: string }) {
  const [previewId, setPreviewId] = useState<string | undefined>(initialId);
  return <Ctx.Provider value={{ previewId, setPreviewId }}>{children}</Ctx.Provider>;
}

export function useProductView() {
  return useContext(Ctx);
}
