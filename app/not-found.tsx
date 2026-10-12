import Link from "next/link";

export default function NotFound() {
  return (
    <section className="max-w-xl mx-auto px-5 py-24 text-center">
      <h1 className="font-script text-6xl text-brand-ink">Ups…</h1>
      <p className="mt-4 text-brand-ink/70">No encontramos lo que buscabas.</p>
      <Link href="/tienda" className="btn-primary inline-flex mt-8 px-8 py-3 font-semibold">
        Ir a la tienda
      </Link>
    </section>
  );
}
