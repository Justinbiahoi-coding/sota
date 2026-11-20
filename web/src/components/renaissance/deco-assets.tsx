import React from "react"
import { cn } from "@/lib/utils"

/**
 * 1. Góc hoa văn mạ vàng bảo tàng (Gilded Museum Corner Brackets)
 * Dùng để trang trí 4 góc của thẻ tranh, khung vòm, hoặc bảng placard
 */
export function RenaissanceCorners({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 z-20", className)} aria-hidden="true">
      {/* Top Left Corner */}
      <span className="absolute left-2 top-2 size-3.5 border-l-2 border-t-2 border-[#d4af37]/80 rounded-tl-[1px]">
        <span className="absolute -top-1 -left-1 size-1 rounded-full bg-[#d4af37] shadow-[0_0_4px_#d4af37]" />
      </span>
      {/* Top Right Corner */}
      <span className="absolute right-2 top-2 size-3.5 border-r-2 border-t-2 border-[#d4af37]/80 rounded-tr-[1px]">
        <span className="absolute -top-1 -right-1 size-1 rounded-full bg-[#d4af37] shadow-[0_0_4px_#d4af37]" />
      </span>
      {/* Bottom Left Corner */}
      <span className="absolute bottom-2 left-2 size-3.5 border-b-2 border-l-2 border-[#d4af37]/80 rounded-bl-[1px]">
        <span className="absolute -bottom-1 -left-1 size-1 rounded-full bg-[#d4af37] shadow-[0_0_4px_#d4af37]" />
      </span>
      {/* Bottom Right Corner */}
      <span className="absolute bottom-2 right-2 size-3.5 border-b-2 border-r-2 border-[#d4af37]/80 rounded-br-[1px]">
        <span className="absolute -bottom-1 -right-1 size-1 rounded-full bg-[#d4af37] shadow-[0_0_4px_#d4af37]" />
      </span>
    </div>
  )
}

/**
 * 2. Đinh tán đồng bảo tàng (Brass Placard Studs)
 * Dùng làm điểm nhấn bên cạnh nhãn curator, mã hiện vật hoặc ngày triển lãm
 */
export function BrassPlacardPin({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full bg-gradient-to-br from-[#fbe396] via-[#d4af37] to-[#8d6216] shadow-[0_0_6px_rgba(212,175,55,0.7)] border border-[#785312] shrink-0",
        className
      )}
      aria-hidden="true"
    />
  )
}

/**
 * 3. Thước chia hoa văn Phục Hưng & Art Deco (Renaissance Ornamental Divider)
 * Dùng ngăn cách tinh tế giữa các chương mục triển lãm với hoạ tiết mặt trời Smithsonian
 */
export function RenaissanceDivider({ title, className }: { title?: string; className?: string }) {
  return (
    <div className={cn("relative my-10 flex items-center justify-center", className)}>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-[#d4af37]" />
      
      {/* Floral / Sun medallion in center */}
      <div className="mx-4 flex items-center gap-3">
        <svg className="size-4 text-[#d4af37]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>

        {title && (
          <span className="font-heading text-xs tracking-[0.25em] uppercase text-[#92400e] font-semibold">
            {title}
          </span>
        )}

        <svg className="size-4 text-[#d4af37]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>

      <div className="h-px flex-1 bg-gradient-to-r from-[#d4af37] via-[#d4af37]/50 to-transparent" />
    </div>
  )
}

/**
 * 4. Huy hiệu cổ điển Smithsonian & Renaissance (Classical Museum Medallion)
 * Khắc họa mặt trời Smithsonian 16 tia sáng và vòng nguyệt quế La Mã
 */
export function ClassicalMuseumMedallion({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-10 text-[#d4af37]", className)}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer decorative ring */}
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
      <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      
      {/* Smithsonian Sunburst Rays */}
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="50" y1="12" x2="50" y2="22" />
        <line x1="50" y1="78" x2="50" y2="88" />
        <line x1="12" y1="50" x2="22" y2="50" />
        <line x1="78" y1="50" x2="88" y2="50" />
        <line x1="23" y1="23" x2="30" y2="30" />
        <line x1="70" y1="70" x2="77" y2="77" />
        <line x1="77" y1="23" x2="70" y2="30" />
        <line x1="23" y1="77" x2="30" y2="70" />
      </g>

      {/* Sun Center with Gold Glow */}
      <circle cx="50" cy="50" r="14" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
      <polygon points="50,40 53,47 60,50 53,53 50,60 47,53 40,50 47,47" fill="currentColor" />
    </svg>
  )
}

/**
 * 5. Khung tranh bảo tàng mạ vàng cổ điển (Gilded Museum Picture Frame)
 * Bọc lấy tác phẩm tranh hoặc ảnh viện bảo tàng với viền vàng đa tầng và pass-partout nhung
 */
export function GildedMuseumFrame({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative rounded-lg p-1.5 transition-all duration-300",
        // Multi-layered gilded gold molding
        "bg-gradient-to-br from-[#ebd59b] via-[#d4af37] to-[#8d6718]",
        "shadow-[0_4px_16px_-2px_rgba(212,175,55,0.35),inset_0_1px_1px_rgba(255,255,255,0.7)]",
        className
      )}
    >
      {/* Beveled Inner Frame */}
      <div className="relative overflow-hidden rounded-[5px] bg-[#1a140d] ring-1 ring-black/30">
        {/* Subtle gilded inner matting fillet */}
        <div className="pointer-events-none absolute inset-0 z-10 border border-[#d4af37]/40 ring-1 ring-black/40" />
        {children}
      </div>
    </div>
  )
}

/**
 * 6. Dải hoa văn diềm cổ điển (Renaissance Frieze Ornament)
 * Dùng làm đường viền nghệ thuật trên đầu banner catalog hoặc footer
 */
export function RenaissanceFrieze({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-full items-center justify-center overflow-hidden opacity-30 select-none", className)} aria-hidden="true">
      <svg className="w-full h-3 text-[#d4af37]" viewBox="0 0 1200 12" fill="none" preserveAspectRatio="repeat-x">
        <pattern id="frieze" width="40" height="12" patternUnits="userSpaceOnUse">
          <path d="M 0 6 L 10 0 L 20 6 L 30 0 L 40 6 L 30 12 L 20 6 L 10 12 Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <circle cx="20" cy="6" r="1.5" fill="currentColor" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#frieze)" />
      </svg>
    </div>
  )
}
