// Fechas como texto "YYYY-MM-DD" (sin pasar por Date para que la zona horaria no corra el día).

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export type Period = { start: string; end: string };

const p2 = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${p2(m)}-${p2(d)}`;
const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate(); // m = 1..12

function parts(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d };
}

export function isValidDate(value: string | undefined | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const { y, m, d } = parts(value);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

/** Quincena a la que pertenece una fecha: del 1 al 15, o del 16 al fin de mes. */
export function quincenaOf(date: string): Period {
  const { y, m, d } = parts(date);
  return d <= 15 ? { start: iso(y, m, 1), end: iso(y, m, 15) } : { start: iso(y, m, 16), end: iso(y, m, lastDay(y, m)) };
}

export function prevQuincena(date: string): Period {
  const { y, m, d } = parts(date);
  if (d > 15) return { start: iso(y, m, 1), end: iso(y, m, 15) };
  const pm = m === 1 ? 12 : m - 1;
  const py = m === 1 ? y - 1 : y;
  return { start: iso(py, pm, 16), end: iso(py, pm, lastDay(py, pm)) };
}

export function monthOf(date: string): Period {
  const { y, m } = parts(date);
  return { start: iso(y, m, 1), end: iso(y, m, lastDay(y, m)) };
}

export function prevMonth(date: string): Period {
  const { y, m } = parts(date);
  const pm = m === 1 ? 12 : m - 1;
  const py = m === 1 ? y - 1 : y;
  return { start: iso(py, pm, 1), end: iso(py, pm, lastDay(py, pm)) };
}

const fmt = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`;

/** Nombre sugerido: "1ª quincena de octubre 2026", "Octubre 2026" o "Cuadre del 03/10/2026 al 09/10/2026". */
export function periodName(start: string, end: string) {
  const q = quincenaOf(start);
  const { y, m, d } = parts(start);
  if (q.start === start && q.end === end) return `${d <= 15 ? "1ª" : "2ª"} quincena de ${MONTHS[m - 1]} ${y}`;
  const mo = monthOf(start);
  if (mo.start === start && mo.end === end) return `${MONTHS[m - 1][0].toUpperCase()}${MONTHS[m - 1].slice(1)} ${y}`;
  return `Cuadre del ${fmt(start)} al ${fmt(end)}`;
}
