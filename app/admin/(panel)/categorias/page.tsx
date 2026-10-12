import PageTitle from "@/components/admin/PageTitle";
import ErrorNote from "@/components/admin/ErrorNote";
import CategoryManager, { type CategoryItem } from "@/components/admin/CategoryManager";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const supabase = await createClient();
  const [cats, prods] = await Promise.all([
    supabase.from("categories").select("id, label, description, icon").order("sort_order", { ascending: true }).order("label", { ascending: true }),
    supabase.from("products").select("category"),
  ]);

  const missingTable = cats.error?.code === "PGRST205" || cats.error?.code === "42P01";
  const counts = new Map<string, number>();
  for (const p of prods.data ?? []) counts.set(p.category as string, (counts.get(p.category as string) ?? 0) + 1);

  const items: CategoryItem[] = (cats.data ?? []).map((c) => ({
    id: c.id as string,
    label: c.label as string,
    description: (c.description as string) ?? "",
    icon: (c.icon as string) ?? "package",
    count: counts.get(c.id as string) ?? 0,
  }));

  return (
    <>
      <PageTitle title="Categorías" description="Agrega, cambia, ordena o quita las categorías de tu tienda." />
      {missingTable ? (
        <ErrorNote message="Todavía no existe la tabla de categorías. Abre el archivo supabase/categorias.sql, pégalo en el SQL Editor de Supabase y dale Run. Luego recarga esta página." />
      ) : (
        <>
          {cats.error && <ErrorNote message={cats.error.message} />}
          <CategoryManager items={items} />
        </>
      )}
    </>
  );
}
