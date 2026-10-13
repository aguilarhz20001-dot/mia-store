import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageTitle from "@/components/admin/PageTitle";
import ProductForm from "@/components/admin/ProductForm";
import VariantManager from "@/components/admin/VariantManager";
import type { VariantRow } from "@/lib/admin/types";
import { createClient } from "@/lib/supabase/server";
import type { ProductRow } from "@/lib/products";
import { fetchCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function EditarProductoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ publicar?: string }>;
}) {
  const { id } = await params;
  const { publicar } = await searchParams;
  // Los productos nuevos siempre empiezan en Bodega; aquí solo se completan y se publican.
  if (id === "nuevo") redirect("/admin/bodega");
  const publishMode = publicar === "1";
  let product: ProductRow | undefined;
  let variants: VariantRow[] = [];
  const supabase = await createClient();
  const categories = await fetchCategories(supabase);

  if (id !== "nuevo") {
    const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    product = data as ProductRow;
    // Si todavía no corriste variantes-y-pedidos.sql, la consulta falla y simplemente no hay estilos.
    const { data: variantData } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", id)
      .order("sort_order")
      .order("created_at");
    variants = (variantData ?? []) as VariantRow[];
  }

  return (
    <>
      <Link href="/admin/productos" className="mb-3 inline-flex items-center gap-1 text-sm text-brand-pink-dark hover:underline">
        <ArrowLeft size={16} /> Volver a productos
      </Link>
      <PageTitle title={publishMode ? "Publicar producto" : "Editar producto"} />
      {publishMode && product && (
        <p className="mb-4 rounded-xl bg-brand-lilac-light px-4 py-3 text-sm text-brand-ink/80">
          Este producto ya está en tu bodega con <strong>{product.stock}</strong> {product.stock === 1 ? "unidad" : "unidades"}. Completa el precio de venta,
          la descripción y las fotos, y al guardar se publica en la tienda.
        </p>
      )}
      <ProductForm key={`${product?.id ?? "nuevo"}-${variants.length}`} product={product} categories={categories} publishMode={publishMode} hasVariants={variants.length > 0} />
      {product && variants.length > 0 && <VariantManager productId={product.id} productStock={product.stock} variants={variants} />}
    </>
  );
}
