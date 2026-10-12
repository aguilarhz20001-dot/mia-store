"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import Logo from "./Logo";
import { useCart } from "@/lib/cart";

const NAV_ITEMS = [
  { href: "/", label: "Inicio" },
  { href: "/tienda", label: "Tienda" },
  { href: "/envios", label: "Envíos" },
  { href: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-brand-pink-light/80 backdrop-blur-md border-b border-brand-pink/20 shadow-sm shadow-brand-pink/10">
      <nav className="max-w-7xl mx-auto px-5 sm:px-8 py-2 grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-6">
        <Logo size={72} />

        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={pathname === item.href}
              className="nav-link text-base font-medium text-brand-ink/80"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Link
            href="/carrito"
            aria-label={`Carrito, ${count} productos`}
            className="relative w-11 h-11 flex items-center justify-center rounded-full hover:bg-brand-pink-light text-brand-pink-dark transition-colors"
          >
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-brand-pink-dark text-white text-[11px] font-semibold flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-brand-pink-light"
          >
            <div className="flex flex-col gap-1.5">
              <span className="block w-6 h-0.5 bg-brand-ink" />
              <span className="block w-6 h-0.5 bg-brand-ink" />
              <span className="block w-6 h-0.5 bg-brand-ink" />
            </div>
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-brand-pink/15 bg-white px-5 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              data-active={pathname === item.href}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-brand-ink/80 data-[active=true]:bg-brand-pink-light data-[active=true]:text-brand-pink-dark"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
