import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Các route yêu cầu xác thực khi có Supabase URL được cấu hình
const PROTECTED = ["/don-hang", "/ve-cua-toi"]

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Refresh session — required for SSR auth to work
    const { data: { user } } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname
    const isProtected = PROTECTED.some(p => path === p || path.startsWith(p + "/"))

    if (isProtected && !user) {
      const url = request.nextUrl.clone()
      url.pathname = "/dang-nhap"
      url.searchParams.set("redirect", path)
      return NextResponse.redirect(url)
    }
  } catch {
    // Phòng hộ SSR: không bao giờ để lỗi cấu hình Supabase làm sập trang 500
    return NextResponse.next({ request })
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
