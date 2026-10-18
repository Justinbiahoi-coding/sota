import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client dùng ở phía trình duyệt (Client Component). Không dùng
 * file này trong Server Component/API route — xem server.ts.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
