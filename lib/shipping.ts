export type DeliveryId = "chimaltenango" | "nacional";

export type DeliveryOption = {
  id: DeliveryId;
  label: string;
  description: string;
  /** Costo en quetzales */
  fee: number;
};

// Mia Store es 100% en línea: no hay recojo en tienda (por ahora).
// Entrega en Chimaltenango: gratis, en un punto de encuentro.
// El costo del envío nacional (Q35) es un valor de ejemplo: ajústalo.
export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "chimaltenango",
    label: "Entrega en Chimaltenango",
    description: "Entrega gratis en un punto de encuentro.",
    fee: 0,
  },
  {
    id: "nacional",
    label: "Envío a otro departamento",
    description: "Envío por paquetería a todo el país.",
    fee: 35,
  },
];

export function getDeliveryOption(id: string) {
  return DELIVERY_OPTIONS.find((o) => o.id === id) ?? DELIVERY_OPTIONS[0];
}
