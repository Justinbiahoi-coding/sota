import { createBrowserClient } from "@supabase/ssr";

// Minimal valid-format JWT for local dev without real Supabase keys
const PLACEHOLDER_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJwbGFjZWhvbGRlciJ9.placeholder"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_JWT,
  );
}
