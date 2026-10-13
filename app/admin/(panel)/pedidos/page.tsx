import Link from "next/link";
import { MessageCircle } from "lucide-react";
import PageTitle from "@/components/admin/PageTitle";
import OrderActions from "@/components/admin/OrderActions";
import { createClient } from "@/lib/supabase/server";
import { formatQ } from "@/lib/format";
import { getDeliveryOption } from "@/lib/shipping";
import type { OrderItemRow, OrderRow, OrderStatus, VariantRow } from "@/lib/admin/types";
import type { ProductRow } from "@/lib/products";

export const dynamic = "force-dynamic";

const TABS: { id: OrderStatus; label: string }[] = [
  { id: "pendiente", label: "Pendientes" },
  { id: "vendido", label: "Vendidos" },
  { id: "cancelado", label: "Cancelados" },
];

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("es-GT", {
    timeZone: "America/Guatemala",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** "5555-1234" → enlace de WhatsApp (agrega 502 si son 8 dígitos) */
function waLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const full = digits.length === 8 ? `502${digits}` : digits;
  return `https://wa.me/${full}`;
}

export default async function PedidosPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const status: OrderStatus = TABS.some((t) => t.id === estado) ? (estado as OrderStatus) : "pendiente";

  const supabase = await createClient();
  const { data: orderData, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: status === "pendiente" })
    .limit(200);

  if (error) {
    const missing = error.code === "PGRST205" || error.code === "42P01";
    return (
      <>
        <PageTitle title="Pedidos" />
        <div className="card p-6 text-brand-ink/80">
          <p className="font-semibold text-brand-ink">{missing ? "Falta un paso para activar los pedidos." : "No se pudieron cargar los pedidos."}</p>
          <p className="mt-1 text-sm">
            {missing ? (
              <>
                Corre el archivo <code>supabase/variantes-y-pedidos.sql</code> en el SQL Editor de Supabase (una sola vez) y recarga esta página.
              </>
            ) : (
              error.message
            )}
          </p>
        </div>
      </>
    );
  }

  const orders = (orderData ?? []) as OrderRow[];
  const orderIds = orders.map((o) => o.id);

  const [{ data: itemData }, { data: variantData }, { data: productData }, ...counts] = await Promise.all([
    orderIds.length > 0 ? supabase.from("order_items").select("*").in("order_id", orderIds).order("created_at") : Promise.resolve({ data: [] }),
    supabase.from("product_variants").select("id, stock"),
    supabase.from("products").select("id, stock"),
    ...TABS.map((t) => supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", t.id)),
  ]);

  const items = (itemData ?? []) as OrderItemRow[];
  const variantStock = new Map(((variantData ?? []) as Pick<VariantRow, "id" | "stock">[]).map((v) => [v.id, v.stock]));
  const productStock = new Map(((productData ?? []) as Pick<ProductRow, "id" | "stock">[]).map((p) => [p.id, p.stock]));
  const countOf = new Map(TABS.map((t, i) => [t.id, counts[i].count ?? 0]));

  return (
    <>
      <PageTitle
        title="Pedidos"
        description="Lo que tus clientes envían desde el carrito queda guardado aquí. Al marcarlo vendido se registran las ventas y se descuenta el stock."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link key={t.id} href={t.id === "pendiente" ? "/admin/pedidos" : `/admin/pedidos?estado=${t.id}`} data-active={status === t.id} className="chip">
            {t.label} ({countOf.get(t.id) ?? 0})
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="card p-8 text-center text-brand-ink/60">
          {status === "pendiente" ? "No tienes pedidos pendientes." : "No hay pedidos en esta lista."}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const orderItems = items.filter((i) => i.order_id === o.id);

            // ¿Alcanza el stock actual para este pedido? (se suma lo pedido por estilo/producto)
            const demand = new Map<string, number>();
            for (const i of orderItems) {
              const key = i.variant_id ?? `p:${i.product_id}`;
              demand.set(key, (demand.get(key) ?? 0) + i.qty);
            }
            const stockOf = (i: OrderItemRow) => (i.variant_id ? variantStock.get(i.variant_id) : productStock.get(i.product_id)) ?? 0;
            const short = status === "pendiente" ? orderItems.filter((i) => (demand.get(i.variant_id ?? `p:${i.product_id}`) ?? 0) > stockOf(i)) : [];

            return (
              <article key={o.id} className="card p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-brand-ink">Pedido #{o.number}</h2>
                    <p className="text-sm text-brand-ink/55">
                      {formatDateTime(o.created_at)}
                      {o.completed_at && status === "vendido" && ` · vendido ${formatDateTime(o.completed_at)}`}
                    </p>
                  </div>
                  <p className="text-xl font-bold tabular-nums text-brand-pink-dark">{formatQ(Number(o.total))}</p>
                </div>

                <div className="mt-4 grid gap-5 md:grid-cols-2">
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-brand-ink">{o.customer_name}</p>
                    <a href={waLink(o.customer_phone)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand-pink-dark hover:underline">
                      <MessageCircle size={15} /> {o.customer_phone}
                    </a>
                    <p className="text-brand-ink/70">
                      <span className="font-medium">{getDeliveryOption(o.delivery).label}:</span> {o.address}
                    </p>
                    {o.notes && <p className="text-brand-ink/70"><span className="font-medium">Notas:</span> {o.notes}</p>}
                  </div>

                  <ul className="space-y-1.5 text-sm">
                    {orderItems.map((i) => (
                      <li key={i.id} className="flex justify-between gap-3">
                        <span className="text-brand-ink">
                          {i.qty} × {i.product_name}
                          {(i.variant_name || i.size) && (
                            <span className="text-brand-ink/60"> ({[i.variant_name, i.size ? `talla ${i.size}` : ""].filter(Boolean).join(", ")})</span>
                          )}
                        </span>
                        <span className="tabular-nums text-brand-ink/70">{formatQ(i.qty * Number(i.unit_price))}</span>
                      </li>
                    ))}
                    <li className="flex justify-between gap-3 border-t border-brand-pink/20 pt-1.5 text-brand-ink/60">
                      <span>{getDeliveryOption(o.delivery).label}</span>
                      <span className="tabular-nums">{Number(o.delivery_fee) === 0 ? "Gratis" : formatQ(Number(o.delivery_fee))}</span>
                    </li>
                  </ul>
                </div>

                {short.length > 0 && (
                  <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                    Ojo: no hay stock suficiente de{" "}
                    {[...new Set(short.map((i) => (i.variant_name ? `${i.product_name} (${i.variant_name})` : i.product_name)))].join(", ")}. Repón la bodega antes de
                    marcarlo vendido.
                  </p>
                )}

                <div className="mt-4">
                  <OrderActions id={o.id} number={o.number} status={o.status} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
