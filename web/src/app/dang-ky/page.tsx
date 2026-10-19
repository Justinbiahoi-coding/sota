import type { Metadata } from "next"
import { AuthScene } from "@/components/auth/auth-scene"

export const metadata: Metadata = { title: "Đăng ký" }

export default function Page() {
  return <AuthScene mode="register" />
}
