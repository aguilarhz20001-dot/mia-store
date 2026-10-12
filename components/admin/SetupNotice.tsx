export default function SetupNotice() {
  return (
    <div className="mx-auto max-w-xl px-5 py-20">
      <div className="card p-8">
        <h1 className="font-script text-4xl text-brand-ink">Falta conectar Supabase</h1>
        <p className="mt-3 text-brand-ink/70">
          Para usar el panel, crea el archivo <code className="rounded bg-brand-pink-light px-1.5 py-0.5">.env.local</code>{" "}
          con tu URL y tu clave de Supabase (mira <code className="rounded bg-brand-pink-light px-1.5 py-0.5">.env.example</code>),
          y reinicia el servidor. Los pasos completos están en el README.
        </p>
      </div>
    </div>
  );
}
