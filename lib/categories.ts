export type CategoryId =
  | "ropa"
  | "accesorios"
  | "calzado"
  | "belleza"
  | "hogar"
  | "tecnologia"
  | "varios";

export type Category = {
  id: CategoryId;
  label: string;
  description: string;
};

export const CATEGORIES: Category[] = [
  { id: "ropa", label: "Ropa", description: "Sudaderas, blusas, camisas y más" },
  { id: "accesorios", label: "Accesorios", description: "Bolsos, lentes, joyería y scrunchies" },
  { id: "calzado", label: "Calzado", description: "Tenis y zapatos para todos los días" },
  { id: "belleza", label: "Belleza", description: "Maquillaje y cuidado personal" },
  { id: "hogar", label: "Hogar", description: "Detalles lindos para tu espacio" },
  { id: "tecnologia", label: "Tecnología", description: "Audífonos, fundas y gadgets" },
  { id: "varios", label: "Artículos varios", description: "Muchas cositas más para ti" },
];

export function getCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id);
}
