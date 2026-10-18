import type { Metadata } from "next"
import { Geist_Mono, Hanken_Grotesk, Newsreader } from "next/font/google"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import "./globals.css"

// the faces follow pear.no's (Flecha, GT Standard, GT Standard Mono), with free stand-ins that carry
// Vietnamese: a sharp, high-contrast serif for titles, a grotesk for text, a mono for labels and buttons
const display = Newsreader({ variable: "--font-display", subsets: ["latin", "vietnamese"], axes: ["opsz"], style: ["normal", "italic"] })
const body = Hanken_Grotesk({ variable: "--font-body", subsets: ["latin", "vietnamese"] })
const mono = Geist_Mono({ variable: "--font-label", subsets: ["latin", "vietnamese"] })

export const metadata: Metadata = {
  title: { default: "Sota · Space of the Art", template: "%s · Sota" },
  description: "Một lối vào chung cho cụm bảo tàng Smithsonian: hiện vật, triển lãm, đặt vé, phòng trưng bày 3D và quà lưu niệm.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
