import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageTitle from "@/components/admin/PageTitle";
import ClosingSummary from "@/components/admin/ClosingSummary";
import { createClient } from "@/lib/supabase/server";
import type { ClosingSnapshot } from "@/lib/admin/closing";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CuadreGuardadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("closings").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  const snapshot = data.snapshot as ClosingSnapshot;

  return (
    <>
      <Link href="/admin/cuadre" className="mb-3 inline-flex items-center gap-1 text-sm text-brand-pink-dark hover:underline">
        <ArrowLeft size={16} /> Volver a cuadres
      </Link>
      <PageTitle
        title={data.name as string}
        description={`Del ${formatDate(data.period_start as string)} al ${formatDate(data.period_end as string)} · guardado el ${formatDate(data.created_at as string)}`}
      />
      <p className="mb-6 rounded-xl bg-brand-lilac-light px-4 py-3 text-sm text-brand-ink/80">
        Esta es una foto guardada: los números no cambian aunque después corrijas o borres ventas y compras.
      </p>
      {data.notes && <p className="mb-6 text-brand-ink/70">Notas: {data.notes as string}</p>}
      <ClosingSummary data={snapshot} />
    </>
  );
}
