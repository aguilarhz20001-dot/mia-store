"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, MessageCircle, ShoppingBag, CheckCircle2, LoaderCircle } from "lucide-react";
import { createOrder } from "@/app/actions";
import { useCart, setQty, removeFromCart, clearCart } from "@/lib/cart";
import type { Product } from "@/lib/products";
import { formatQ } from "@/lib/format";
import { DELIVERY_OPTIONS, getDeliveryOption, type DeliveryId } from "@/lib/shipping";
import { whatsappLink } from "@/lib/contact";
import { getCategoryIcon } from "./iconMap";

export default function CartView({ products }: { products: Product[] }) {
  const { items } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [delivery, setDelivery] = useState<DeliveryId>("chimaltenango");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ number?: number; url: string } | null>(null);

  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const lines = items.flatMap((item) => {
    const product = bySlug.get(item.slug);
    if (!product) return [];
    const variant = item.variantId ? product.variants?.find((v) => v.id === item.variantId) : undefined;
    // Estilo que ya no existe, o producto que ahora exige elegir estilo: se quita del carrito
    if (item.variantId && !variant) return [];
    if (!item.variantId && product.variants?.length) return [];
    return [{ item, product, variant }];
  });

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.item.qty, 0);
  const option = getDeliveryOption(delivery);
  const total = subtotal + option.fee;

  if (sent) {
    return (
      <div className="card p-10 text-center max-w-xl mx-auto">
        <span className="icon-badge mx-auto">
          <CheckCircle2 size={26} />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-brand-ink">
          {sent.number ? `¡Pedido #${sent.number} enviado!` : "¡Pedido enviado!"}
        </h2>
        <p className="mt-2 text-brand-ink/70">
          Se abrió WhatsApp con tu pedido. Envía el mensaje y te confirmamos disponibilidad y forma de pago.
        </p>
        <a href={sent.url} target="_blank" rel="noopener noreferrer" className="btn-whatsapp inline-flex items-center gap-2 mt-6 px-7 py-3 font-semibold">
          <MessageCircle size={18} /> Abrir WhatsApp otra vez
        </a>
        <div className="mt-4">
          <Link href="/tienda" className="text-sm text-brand-pink-dark underline">Seguir comprando</Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="card p-10 text-center max-w-xl mx-auto">
        <span className="icon-badge mx-auto">
          <ShoppingBag size={26} />
        </span>
        <h2 className="mt-4 text-xl font-semibold text-brand-ink">Tu carrito está vacío</h2>
        <p className="mt-2 text-brand-ink/70">Descubre todo lo que tenemos para ti.</p>
        <Link href="/tienda" className="btn-primary inline-flex mt-6 px-7 py-3 font-semibold">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    if (!name.trim() || !phone.trim()) {
      setError("Escribe tu nombre y tu número de teléfono.");
      return;
    }
    if (!address.trim()) {
      setError(
        delivery === "nacional"
          ? "Escribe tu dirección completa para el envío."
          : "Escribe dónde te queda mejor el punto de encuentro.",
      );
      return;
    }
    setError("");
    setSending(true);

    // Se abre la pestaña de WhatsApp ahora mismo (antes de guardar) para que el celular no la bloquee.
    const popup = window.open("", "_blank");

    // 1) Guardar el pedido en el sistema como "pendiente" (el stock se descuenta al marcarlo vendido).
    //    Si falla, el pedido igual sale por WhatsApp para no perder la venta.
    let orderNumber: number | undefined;
    try {
      const res = await createOrder({
        name,
        phone,
        delivery,
        address,
        notes,
        lines: lines.map(({ item }) => ({ slug: item.slug, qty: item.qty, size: item.size, variantId: item.variantId })),
      });
      if (res.ok) orderNumber = res.number;
    } catch {
      // se sigue sin número de pedido
    }

    // 2) Armar el mensaje y abrir WhatsApp
    const productLines = lines
      .map(({ item, product, variant }) => {
        const details = [variant ? `estilo ${variant.name}` : "", item.size ? `talla ${item.size}` : ""].filter(Boolean).join(", ");
        return `• ${item.qty} x ${product.name}${details ? ` (${details})` : ""} — ${formatQ(product.price * item.qty)}`;
      })
      .join("\n");

    const message = [
      orderNumber ? `¡Hola Mia Store! Quiero hacer el pedido #${orderNumber}:` : "¡Hola Mia Store! Quiero hacer este pedido:",
      "",
      productLines,
      "",
      `Subtotal: ${formatQ(subtotal)}`,
      `${option.label}: ${option.fee === 0 ? "Gratis" : formatQ(option.fee)}`,
      `*Total: ${formatQ(total)}*`,
      "",
      `Nombre: ${name.trim()}`,
      `Teléfono: ${phone.trim()}`,
      delivery === "nacional" ? `Dirección: ${address.trim()}` : `Punto de encuentro: ${address.trim()}`,
      notes.trim() ? `Notas: ${notes.trim()}` : "",
    ]
      .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
      .join("\n");

    const url = whatsappLink(message);
    if (popup) popup.location.href = url;
    else window.open(url, "_blank", "noopener,noreferrer");

    // 3) El pedido ya quedó guardado: se vacía el carrito
    if (orderNumber) clearCart();
    setSent({ number: orderNumber, url });
    setSending(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] items-start">
      <div className="space-y-4">
        {lines.map(({ item, product, variant }) => {
          const Icon = getCategoryIcon(product.categoryIcon);
          const photo = variant?.image ?? product.image;
          return (
            <div key={`${item.slug}-${item.variantId ?? ""}-${item.size ?? ""}`} className="card p-4 flex gap-4">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-brand-pink-light to-brand-lilac-light flex items-center justify-center text-brand-pink">
                {photo ? (
                  <Image src={photo} alt={product.name} fill sizes="96px" className="object-cover" />
                ) : (
                  <Icon size={36} strokeWidth={1.4} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/producto/${product.slug}`} className="font-semibold text-brand-ink hover:text-brand-pink-dark">
                  {product.name}
                </Link>
                {variant && <p className="text-sm text-brand-ink/60">Estilo: {variant.name}</p>}
                {item.size && <p className="text-sm text-brand-ink/60">Talla {item.size}</p>}
                <p className="text-brand-pink-dark font-bold mt-1">{formatQ(product.price)}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-brand-pink/30">
                    <button type="button" aria-label="Menos" onClick={() => setQty(item.slug, item.qty - 1, item.size, item.variantId)} className="w-8 h-8 flex items-center justify-center text-brand-pink-dark">
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center text-sm font-semibold">{item.qty}</span>
                    <button type="button" aria-label="Más" onClick={() => setQty(item.slug, item.qty + 1, item.size, item.variantId)} className="w-8 h-8 flex items-center justify-center text-brand-pink-dark">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button type="button" aria-label="Quitar producto" onClick={() => removeFromCart(item.slug, item.size, item.variantId)} className="text-brand-ink/40 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <button type="button" onClick={clearCart} className="text-sm text-brand-ink/50 hover:text-red-500">
          Vaciar carrito
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5 lg:sticky lg:top-24">
        <h2 className="text-xl font-semibold text-brand-ink">Datos de tu pedido</h2>

        <div className="space-y-3">
          <input className="input-field" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          <input className="input-field" placeholder="Teléfono / WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-brand-ink mb-2">¿Cómo quieres recibirlo?</legend>
          {DELIVERY_OPTIONS.map((o) => (
            <label
              key={o.id}
              className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                delivery === o.id ? "border-brand-pink bg-brand-pink-light/60" : "border-brand-pink/20 hover:border-brand-pink/50"
              }`}
            >
              <input type="radio" name="delivery" value={o.id} checked={delivery === o.id} onChange={() => setDelivery(o.id)} className="mt-1 accent-[#e07fc3]" />
              <span className="flex-1">
                <span className="flex justify-between gap-2 text-sm font-semibold text-brand-ink">
                  {o.label}
                  <span className="text-brand-pink-dark">{o.fee === 0 ? "Gratis" : formatQ(o.fee)}</span>
                </span>
                <span className="block text-xs text-brand-ink/60">{o.description}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <textarea
          className="input-field"
          rows={3}
          placeholder={
            delivery === "nacional"
              ? "Departamento, municipio y dirección completa"
              : "¿Dónde te queda mejor el punto de encuentro? Zona y referencias"
          }
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <textarea className="input-field" rows={2} placeholder="Notas (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <dl className="space-y-1 text-sm border-t border-brand-pink/20 pt-4">
          <div className="flex justify-between"><dt className="text-brand-ink/70">Subtotal</dt><dd>{formatQ(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-brand-ink/70">Envío</dt><dd>{option.fee === 0 ? "Gratis" : formatQ(option.fee)}</dd></div>
          <div className="flex justify-between text-lg font-bold text-brand-ink pt-1"><dt>Total</dt><dd className="text-brand-pink-dark">{formatQ(total)}</dd></div>
        </dl>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={sending} className="btn-whatsapp w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 font-semibold disabled:opacity-70">
          {sending ? <LoaderCircle size={20} className="animate-spin" /> : <MessageCircle size={20} />}
          {sending ? "Guardando tu pedido…" : "Enviar pedido por WhatsApp"}
        </button>
        <p className="text-xs text-center text-brand-ink/50">
          Te confirmamos disponibilidad y forma de pago por WhatsApp.
        </p>
      </form>
    </div>
  );
}
