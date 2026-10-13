import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import SetupNotice from "@/components/admin/SetupNotice";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/admin/login?error=permiso");

  // Pedidos pendientes para el numerito del menú (si aún no existe la tabla, queda en 0)
  const { count } = await supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pendiente");

  return (
    <AdminShell email={data.user.email ?? ""} pendingOrders={count ?? 0}>
      {children}
    </AdminShell>
  );
}
