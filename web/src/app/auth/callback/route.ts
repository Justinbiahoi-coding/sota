import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Supabase email confirmation redirect lands here (/auth/callback?code=...)
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const rawNext = searchParams.get("next") ?? "/"
  // Only allow absolute paths (starts with / but not //) to prevent open redirect
  const next = /^\/[^/]/.test(rawNext) ? rawNext : "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/dang-nhap?error=invalid_link`)
}
