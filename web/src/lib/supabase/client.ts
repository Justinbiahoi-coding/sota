import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client dùng ở phía trình duyệt (Client Component). Không dùng
 * file này trong Server Component/API route — xem server.ts.
 * Có cơ chế fallback an toàn cho môi trường frontend thử nghiệm (mock demo).
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock-sota-demo.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key-for-frontend-testing-only";
  return createBrowserClient(url, key);
}
