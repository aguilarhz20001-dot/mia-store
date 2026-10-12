import Link from "next/link";
import { PackagePlus, Rocket, Star, ImageIcon } from "lucide-react";
import PageTitle from "@/components/admin/PageTitle";
import ErrorNote from "@/components/admin/ErrorNote";
import StockBadge from "@/components/admin/StockBadge";
import { loadAdminData } from "@/lib/admin/data";
import { findCategory } from "@/lib/categories";
import { formatQ } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  const { error, categories, rows } = await loadAdminData();

  // "Por publicar": ya están en bodega, pero todavía no tienen precio ni se ven en la tienda.
  const pending = rows.filter(({ product }) => !product.active && Number(product.price) === 0);
  const pendingIds = new Set(pending.map(({ product }) => product.id));
  const published = rows.filter(({ product }) => !pendingIds.has(product.id));

  return (
    <>
      <PageTitle
        title="Productos"
        description="Tu catálogo: precio, fotos y video. La mercadería nueva se ingresa en Bodega y aquí la completas y la activas."
        action={
          <Link href="/admin/bodega" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 font-semibold">
            <PackagePlus size={18} /> Ingresar mercadería
          </Link>
        }
      />
      {error && <ErrorNote message={error} />}

      {pending.length > 0 && (
        <section className="card mb-8 p-5 sm:p-6">
          <h2 className="font-semibold text-brand-ink">Por publicar ({pending.length})</h2>
          <p className="mt-1 text-sm text-brand-ink/60">Ya están en tu bodega. Ponles precio y fotos para que se vean en la tienda.</p>
          <ul className="mt-4 divide-y divide-brand-pink/15">
            {pending.map(({ product, stock, bought, avgCost }) => (
              <li key={product.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-brand-ink">{product.name}</p>
                  <p className="text-sm text-brand-ink/60">
                    {findCategory(categories, product.category)?.label ?? product.category} · {stock} {stock === 1 ? "unidad" : "unidades"}
                    {bought > 0 && ` · costo ${formatQ(avgCost)} c/u`}
                  </p>
                </div>
                <Link href={`/admin/productos/${product.id}?publicar=1`} className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold">
                  <Rocket size={16} /> Publicar
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="adm-table">
            <thead>
              <tr>
                <th></th>
                <th>Producto</th>
                <th>Categoría</th>
                <th className="num">Precio</th>
                <th className="num">Stock</th>
                <th>Estado</th>
                <th>En la tienda</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {published.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-brand-ink/50">
                    {pending.length > 0 ? "Todavía no has publicado ningún producto." : "Aún no tienes productos. Empieza ingresando mercadería en Bodega."}
                  </td>
                </tr>
              )}
              {published.map(({ product, stock }) => (
                <tr key={product.id}>
                  <td className="w-16">
                    {product.images && product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-pink-light text-brand-pink">
                        <ImageIcon size={20} />
                      </span>
                    )}
                  </td>
                  <td className="font-medium text-brand-ink">
                    <span className="inline-flex items-center gap-1.5">
                      {product.name}
                      {product.featured && <Star size={14} className="fill-amber-400 text-amber-400" aria-label="Destacado" />}
                    </span>
                    {Number(product.price) === 0 && (
                      <div className="mt-0.5 text-xs font-semibold text-amber-600">Falta ponerle precio</div>
                    )}
                  </td>
                  <td>{findCategory(categories, product.category)?.label ?? product.category}</td>
                  <td className="num">{formatQ(Number(product.price))}</td>
                  <td className="num font-semibold">{stock}</td>
                  <td><StockBadge stock={stock} /></td>
                  <td>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${product.active ? "bg-brand-lilac-light text-brand-lilac-dark" : "bg-gray-100 text-gray-500"}`}>
                      {product.active ? "Visible" : "Oculto"}
                    </span>
                  </td>
                  <td className="num">
                    <Link href={`/admin/productos/${product.id}`} className="text-sm font-medium text-brand-pink-dark hover:underline">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
