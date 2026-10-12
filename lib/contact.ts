// TODO: cambia estos datos por los reales de Mia Store
export const WHATSAPP_DISPLAY = "+502 0000-0000";
export const WHATSAPP_NUMBER = "50200000000";
export const FACEBOOK_URL = "https://www.facebook.com/";
export const INSTAGRAM_URL = "https://www.instagram.com/";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hola Mia Store, quiero más información sobre sus productos.";
