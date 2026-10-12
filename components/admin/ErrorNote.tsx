export default function ErrorNote({ message }: { message: string }) {
  return (
    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <p className="font-semibold">No se pudieron cargar los datos.</p>
      <p className="mt-1">{message}</p>
      <p className="mt-1 text-red-600/80">
        Si es la primera vez, revisa que corriste <code>supabase/schema.sql</code> en el SQL Editor de Supabase.
      </p>
    </div>
  );
}
