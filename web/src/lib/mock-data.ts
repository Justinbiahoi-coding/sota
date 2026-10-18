// Mock data for the frontend while the API is being built (risk "Frontend tụt lại so với backend").
// Shapes follow what the API is expected to return; swap these imports for API calls later.
// Museum names are the real Smithsonian museums; hours and exhibitions are placeholders.

export type Museum = {
  slug: string
  name: string
  nameEn: string
  accent: string // the museum's own accent colour (--museum-accent on its pages)
  opens: string
  closes: string
}

export type Exhibition = {
  slug: string
  title: string
  museumSlug: string
  starts: string // ISO date
  ends: string
}

export const museums: Museum[] = [
  { slug: "lich-su-tu-nhien", name: "Bảo tàng Lịch sử Tự nhiên", nameEn: "National Museum of Natural History", accent: "oklch(0.46 0.07 145)", opens: "10:00", closes: "17:30" },
  { slug: "hang-khong-vu-tru", name: "Bảo tàng Hàng không và Vũ trụ", nameEn: "National Air and Space Museum", accent: "oklch(0.4 0.09 255)", opens: "10:00", closes: "17:30" },
  { slug: "lich-su-hoa-ky", name: "Bảo tàng Lịch sử Hoa Kỳ", nameEn: "National Museum of American History", accent: "oklch(0.5 0.13 30)", opens: "10:00", closes: "17:30" },
  { slug: "phong-tranh-chan-dung", name: "Phòng tranh Chân dung Quốc gia", nameEn: "National Portrait Gallery", accent: "oklch(0.42 0.1 330)", opens: "11:30", closes: "19:00" },
  { slug: "hirshhorn", name: "Bảo tàng và Vườn điêu khắc Hirshhorn", nameEn: "Hirshhorn Museum and Sculpture Garden", accent: "oklch(0.62 0.12 75)", opens: "10:00", closes: "17:30" },
  { slug: "nghe-thuat-chau-a", name: "Bảo tàng Nghệ thuật châu Á", nameEn: "National Museum of Asian Art", accent: "oklch(0.47 0.075 190)", opens: "10:00", closes: "17:30" },
]

export const exhibitions: Exhibition[] = [
  { slug: "hoa-thach-thoi-gian", title: "Hóa thạch: Dòng thời gian sâu", museumSlug: "lich-su-tu-nhien", starts: "2026-09-01", ends: "2027-03-31" },
  { slug: "buoc-ra-quy-dao", title: "Bước ra quỹ đạo", museumSlug: "hang-khong-vu-tru", starts: "2026-10-15", ends: "2027-01-10" },
  { slug: "chan-dung-the-ky", title: "Chân dung một thế kỷ", museumSlug: "phong-tranh-chan-dung", starts: "2026-11-01", ends: "2027-05-02" },
]

export const museumBySlug = (slug: string) => museums.find((m) => m.slug === slug)
