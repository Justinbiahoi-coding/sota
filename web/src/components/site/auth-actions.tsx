"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UserRound } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { User } from "@supabase/supabase-js"

const icon = "inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

export function AuthActions() {
  const [user, setUser] = useState<User | null | undefined>(undefined) // undefined = loading
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push("/")
    router.refresh()
  }

  // loading — render nothing to avoid layout shift (icon slot stays empty briefly)
  if (user === undefined) return <span className="size-9" />

  if (user) {
    return (
      <>
        <Link href="/tai-khoan" className={cn(icon, "hidden sm:inline-flex")} aria-label="Tài khoản"><UserRound className="size-[18px]" /></Link>
        <button onClick={signOut} className={cn(buttonVariants({ size: "lg" }), "ml-2 hidden rounded-full px-4 sm:inline-flex")}>Đăng xuất</button>
      </>
    )
  }

  return (
    <>
      <Link href="/tai-khoan" className={cn(icon, "hidden sm:inline-flex")} aria-label="Tài khoản"><UserRound className="size-[18px]" /></Link>
      <Link href="/dang-nhap" className={cn(buttonVariants({ size: "lg" }), "ml-2 hidden rounded-full px-4 sm:inline-flex")}>Đăng nhập</Link>
    </>
  )
}
