import { stockStatus } from "@/lib/admin/stats";

export default function StockBadge({ stock }: { stock: number }) {
  const status = stockStatus(stock);
  const style =
    status === "agotado"
      ? "bg-red-100 text-red-700"
      : status === "poco"
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-700";
  const label = status === "agotado" ? "Agotado" : status === "poco" ? "Poco stock" : "Disponible";
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>{label}</span>;
}
