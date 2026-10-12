"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import SetupNotice from "@/components/admin/SetupNotice";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    params.get("error") === "permiso" ? "Esa cuenta no tiene permiso para entrar al panel." : "",
  );
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setBusy(false);
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4 p-8">
      <div className="flex flex-col items-center text-center">
        <Image src="/logo.png" alt="Mia Store" width={72} height={72} style={{ width: 72, height: 72 }} />
        <h1 className="mt-2 font-script text-4xl text-brand-ink">Panel Mia Store</h1>
        <p className="text-sm text-brand-ink/60">Entra para administrar tu tienda.</p>
      </div>

      <div>
        <label htmlFor="email" className="adm-label">Correo</label>
        <input id="email" type="email" required autoComplete="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="password" className="adm-label">Contraseña</label>
        <input id="password" type="password" required autoComplete="current-password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={busy} className="btn-primary flex w-full items-center justify-center gap-2 px-6 py-3 font-semibold">
        <LogIn size={18} />
        {busy ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  if (!isSupabaseConfigured) return <SetupNotice />;
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
