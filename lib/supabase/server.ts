
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_KEY } from "./config";

/** Cliente del servidor con la sesión de quien está en el panel. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL!, SUPABASE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: CookieOptions;
        }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // En Server Components, el refresco de sesión lo hace proxy.ts.
        }
      },
    },
  });
}
