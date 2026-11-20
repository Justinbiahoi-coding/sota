import Link from "next/link"
import { NAV } from "./nav"

const HELP = [
  { href: "/dat-ve", label: "Đặt vé tham quan" },
  { href: "/tai-khoan", label: "Vé và đơn hàng của tôi" },
  { href: "/kham-pha", label: "Bản đồ cụm bảo tàng National Mall" },
]

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#d4af37]/20 bg-[#08162b] text-[#f8f6f0]">
      <div className="mx-auto grid max-w-[1560px] gap-12 px-6 py-14 md:grid-cols-12 md:px-12">
        <div className="md:col-span-5">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-5xl font-medium italic tracking-tight text-white">Sota</span>
            <span className="text-[#d4af37] text-sm">✦</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-300">
            Một lối vào chung cho cả cụm bảo tàng Smithsonian: chiêm ngưỡng hiện vật, đặt vé, dạo phòng trưng bày 3D và mua quà lưu niệm giới hạn.
          </p>
        </div>
        <FooterCol title="Tham quan" links={NAV} />
        <FooterCol title="Hỗ trợ & Hướng dẫn" links={HELP} />
      </div>
      <div className="border-t border-white/10 bg-[#061122]">
        <div className="mx-auto flex max-w-[1560px] flex-col gap-2 px-6 py-5 text-xs text-stone-400 md:flex-row md:justify-between md:px-12">
          <p>Dữ liệu hiện vật: Smithsonian Open Access (CC0 Public Domain).</p>
          <p className="text-stone-300">Đồ án Nhập môn Công nghệ phần mềm, HCMUS, 2026 · Nhóm sinh viên thực hiện.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div className="md:col-span-3 md:col-start-auto">
      <p className="placard text-xs uppercase tracking-widest text-[#d4af37] font-semibold">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-stone-300 transition-colors hover:text-[#d4af37] hover:underline underline-offset-4">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
