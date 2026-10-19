import type { Metadata } from "next"
import { AuthScene } from "@/components/auth/auth-scene"

export const metadata: Metadata = { title: "Đăng nhập" }

export default function Page() {
  return <AuthScene mode="login" />
}
