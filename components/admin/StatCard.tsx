export default function StatCard({
  label,
  value,
  note,
  tone = "default",
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "default" | "good" | "bad";
}) {
  const color = tone === "good" ? "text-emerald-600" : tone === "bad" ? "text-red-600" : "text-brand-ink";
  return (
    <div className="card p-5">
      <p className="text-sm text-brand-ink/60">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${color}`}>{value}</p>
      {note && <p className="mt-1 text-xs text-brand-ink/50">{note}</p>}
    </div>
  );
}
