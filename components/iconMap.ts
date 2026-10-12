import {
  Shirt,
  ShoppingBag,
  Footprints,
  Sparkles,
  House,
  Headphones,
  Gift,
  Heart,
  Star,
  Baby,
  Watch,
  Gem,
  Palette,
  Scissors,
  Glasses,
  Smartphone,
  Tag,
  Package,
  type LucideIcon,
} from "lucide-react";

/** Íconos que se pueden elegir para una categoría (el panel guarda el nombre, ej. "shirt"). */
export const CATEGORY_ICON_OPTIONS: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: "shirt", label: "Ropa", Icon: Shirt },
  { id: "shopping-bag", label: "Bolso", Icon: ShoppingBag },
  { id: "footprints", label: "Calzado", Icon: Footprints },
  { id: "sparkles", label: "Brillos / belleza", Icon: Sparkles },
  { id: "house", label: "Hogar", Icon: House },
  { id: "headphones", label: "Audífonos", Icon: Headphones },
  { id: "gift", label: "Regalo", Icon: Gift },
  { id: "heart", label: "Corazón", Icon: Heart },
  { id: "star", label: "Estrella", Icon: Star },
  { id: "baby", label: "Bebé", Icon: Baby },
  { id: "watch", label: "Reloj", Icon: Watch },
  { id: "gem", label: "Joyería", Icon: Gem },
  { id: "palette", label: "Arte / maquillaje", Icon: Palette },
  { id: "scissors", label: "Tijeras", Icon: Scissors },
  { id: "glasses", label: "Lentes", Icon: Glasses },
  { id: "smartphone", label: "Celular", Icon: Smartphone },
  { id: "tag", label: "Etiqueta", Icon: Tag },
  { id: "package", label: "Paquete", Icon: Package },
];

/** Devuelve el ícono por su nombre; si no existe, un paquete. */
export function getCategoryIcon(name?: string | null): LucideIcon {
  return CATEGORY_ICON_OPTIONS.find((o) => o.id === name)?.Icon ?? Package;
}
