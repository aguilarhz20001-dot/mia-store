import {
  Shirt,
  ShoppingBag,
  Footprints,
  Sparkles,
  House,
  Headphones,
  Gift,
  type LucideIcon,
} from "lucide-react";
import type { CategoryId } from "@/lib/categories";

export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  ropa: Shirt,
  accesorios: ShoppingBag,
  calzado: Footprints,
  belleza: Sparkles,
  hogar: House,
  tecnologia: Headphones,
  varios: Gift,
};
