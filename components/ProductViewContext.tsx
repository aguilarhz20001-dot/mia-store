"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type View = {
  /** Estilo cuya foto se está viendo en la galería (undefined = fotos generales) */
  previewId?: string;
  setPreviewId: (id?: string) => void;
};

const Ctx = createContext<View>({ previewId: undefined, setPreviewId: () => {} });

/** Conecta la galería con el selector de estilos de la página del producto. */
export function ProductViewProvider({ children }: { children: ReactNode }) {
  const [previewId, setPreviewId] = useState<string | undefined>(undefined);
  return <Ctx.Provider value={{ previewId, setPreviewId }}>{children}</Ctx.Provider>;
}

export function useProductView() {
  return useContext(Ctx);
}
