import type { PaidFrom } from "@/lib/admin/types";

/** «¿Con qué dinero se pagó?»: de la caja (resta de la caja) o dinero personal (no la toca). */
export default function PaidFromSelect({ id, value, onChange }: { id: string; value: PaidFrom; onChange: (v: PaidFrom) => void }) {
  return (
    <div>
      <label htmlFor={id} className="adm-label">¿Con qué dinero se pagó?</label>
      <select id={id} className="input-field" value={value} onChange={(e) => onChange(e.target.value as PaidFrom)}>
        <option value="caja">Del dinero de la caja</option>
        <option value="personal">Dinero personal (no toca la caja)</option>
      </select>
    </div>
  );
}
