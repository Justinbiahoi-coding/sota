import type { Metadata } from "next"
import { LiquidCanvas } from "@/components/liquid-canvas"
import { Geist_Mono, Hanken_Grotesk, Newsreader, Pinyon_Script } from "next/font/google"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { CartProvider } from "@/lib/cart-context"
import "./globals.css"

// the faces follow pear.no's (Flecha, GT Standard, GT Standard Mono), with free stand-ins that carry
// Vietnamese: a sharp, high-contrast serif for titles, a grotesk for text, a mono for labels and buttons
const display = Newsreader({ variable: "--font-display", subsets: ["latin", "vietnamese"], axes: ["opsz"], style: ["normal", "italic"] })
const body = Hanken_Grotesk({ variable: "--font-body", subsets: ["latin", "vietnamese"] })
const mono = Geist_Mono({ variable: "--font-label", subsets: ["latin", "vietnamese"] })
// and a copperplate script for the odd word set by hand, like pear.no's "signing"
const script = Pinyon_Script({ variable: "--font-script", subsets: ["latin", "vietnamese"], weight: "400" })

export const metadata: Metadata = {
  title: { default: "Sota · Space of the Art", template: "%s · Sota" },
  description: "Một lối vào chung cho cụm bảo tàng Smithsonian: hiện vật, triển lãm, đặt vé, phòng trưng bày 3D và quà lưu niệm.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${display.variable} ${body.variable} ${mono.variable} ${script.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col relative selection:bg-foreground selection:text-background">
        <LiquidCanvas />
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  )
}
