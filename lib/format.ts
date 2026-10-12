export function formatQ(amount: number) {
  return `Q${amount.toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPct(value: number) {
  return `${value.toLocaleString("es-GT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

/** "2026-10-12" → "12/10/2026" (sin pasar por Date para no correr el día por la zona horaria) */
export function formatDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

/** Fecha de hoy en Guatemala, como "YYYY-MM-DD". */
export function todayGT() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Guatemala" }).format(new Date());
}

/** "Sudadera rosa" → "sudadera-rosa" */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
