import type { Metadata } from "next"
import { Be_Vietnam_Pro, Fraunces } from "next/font/google"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import "./globals.css"

// display: a soft, characterful serif for titles; body: drawn for Vietnamese, so the diacritics sit right
const display = Fraunces({ variable: "--font-display", subsets: ["latin", "vietnamese"], axes: ["opsz", "SOFT"] })
const body = Be_Vietnam_Pro({ variable: "--font-body", subsets: ["latin", "vietnamese"], weight: ["300", "400", "500", "600"] })

export const metadata: Metadata = {
  title: { default: "Sota · Space of the Art", template: "%s · Sota" },
  description: "Một lối vào chung cho cụm bảo tàng Smithsonian: hiện vật, triển lãm, đặt vé, phòng trưng bày 3D và quà lưu niệm.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
