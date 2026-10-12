"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  PackagePlus,
  TrendingUp,
  Tags,
  ClipboardCheck,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { signOutAction } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/bodega", label: "Bodega", icon: Warehouse },
  { href: "/admin/compras", label: "Compras", icon: PackagePlus },
  { href: "/admin/ventas", label: "Ventas", icon: TrendingUp },
  { href: "/admin/cuadre", label: "Cuadre", icon: ClipboardCheck },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
];

export default function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="min-h-screen md:grid md:grid-cols-[15rem_1fr]">
      {/* Menú lateral (escritorio) */}
      <aside className="hidden md:flex flex-col border-r border-brand-pink/20 bg-white/80 backdrop-blur px-4 py-6 sticky top-0 h-screen">
        <Link href="/admin" className="flex items-center gap-3 px-2" aria-label="Panel Mia Store">
          <Image src="/logo.png" alt="" width={48} height={48} style={{ width: 48, height: 48 }} />
          <span>
            <span className="block font-script text-2xl leading-none text-brand-ink">Mia Store</span>
            <span className="text-xs text-brand-ink/50">Panel administrativo</span>
          </span>
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(href)
                  ? "bg-gradient-to-r from-brand-pink to-brand-lilac text-white shadow-sm"
                  : "text-brand-ink/75 hover:bg-brand-pink-light"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-1 border-t border-brand-pink/15 pt-4">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-brand-ink/70 hover:bg-brand-pink-light">
            <ExternalLink size={16} /> Ver la tienda
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-brand-ink/70 hover:bg-brand-pink-light">
              <LogOut size={16} /> Cerrar sesión
            </button>
          </form>
          <p className="truncate px-3 pt-2 text-xs text-brand-ink/40" title={email}>{email}</p>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Barra superior (celular) */}
        <header className="md:hidden sticky top-0 z-30 border-b border-brand-pink/20 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="font-script text-2xl text-brand-ink">Mia Store · Panel</span>
            <form action={signOutAction}>
              <button type="submit" aria-label="Cerrar sesión" className="rounded-full p-2 text-brand-ink/70 hover:bg-brand-pink-light">
                <LogOut size={18} />
              </button>
            </form>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ${
                  isActive(href) ? "bg-brand-pink-dark text-white" : "bg-brand-pink-light text-brand-ink/75"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">{children}</div>
      </div>
    </div>
  );
}
