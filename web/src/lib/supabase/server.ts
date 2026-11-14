import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client dùng ở phía server (Server Component, Route Handler,
 * Server Action) — đọc/ghi cookie phiên đăng nhập qua Next.js `cookies()`.
 * Không dùng file này trong Client Component — xem client.ts.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJwbGFjZWhvbGRlciJ9.placeholder",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Bỏ qua nếu gọi từ Server Component (không ghi được cookie ở
            // đây) — middleware sẽ làm mới session thay, xem Supabase docs.
          }
        },
      },
    },
  );
}
