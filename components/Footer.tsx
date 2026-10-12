import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import Logo from "./Logo";
import FacebookIcon from "./icons/FacebookIcon";
import InstagramIcon from "./icons/InstagramIcon";
import {
  FACEBOOK_URL,
  INSTAGRAM_URL,
  WHATSAPP_DISPLAY,
  whatsappLink,
  DEFAULT_WHATSAPP_MESSAGE,
} from "@/lib/contact";

export default function Footer() {
  return (
    <footer className="mt-24 bg-white border-t border-brand-pink/15">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 grid gap-10 sm:grid-cols-3">
        <div>
          <Logo size={72} />
          <p className="mt-3 text-sm text-brand-ink/70 max-w-xs">
            Todo lo que te gusta… en un solo lugar. Ropa, accesorios y muchas cositas más.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-brand-ink">Navegar</h3>
          <ul className="mt-3 space-y-2 text-sm text-brand-ink/70">
            <li><Link href="/tienda" className="hover:text-brand-pink-dark">Tienda</Link></li>
            <li><Link href="/envios" className="hover:text-brand-pink-dark">Envíos y entregas</Link></li>
            <li><Link href="/carrito" className="hover:text-brand-pink-dark">Mi carrito</Link></li>
            <li><Link href="/contacto" className="hover:text-brand-pink-dark">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-brand-ink">Contáctanos</h3>
          <ul className="mt-3 space-y-2 text-sm text-brand-ink/70">
            <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-brand-pink-dark" />Entregas en Chimaltenango y envíos a todo el país</li>
            <li>
              <a
                href={whatsappLink(DEFAULT_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-brand-pink-dark"
              >
                <MessageCircle size={16} className="text-brand-pink-dark" />
                {WHATSAPP_DISPLAY}
              </a>
            </li>
          </ul>
          <div className="mt-4 flex gap-3">
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-brand-pink-light text-brand-pink-dark flex items-center justify-center hover:bg-brand-pink hover:text-white transition-colors">
              <FacebookIcon className="w-5 h-5" />
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-brand-pink-light text-brand-pink-dark flex items-center justify-center hover:bg-brand-pink hover:text-white transition-colors">
              <InstagramIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-brand-pink/15 py-4 text-center text-xs text-brand-ink/50">
        © {new Date().getFullYear()} Mia Store. Todos los derechos reservados.
      </div>
    </footer>
  );
}
