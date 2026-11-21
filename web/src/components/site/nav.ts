// the site's main sections (header, mobile menu and footer all read this list)
export const NAV = [
  { href: "/bao-tang", label: "Bảo tàng" },
  {
    href: "#",
    label: "Hiện vật",
    dropdown: [
      { href: "/bao-tang/lich-su-tu-nhien", label: "Lịch sử Tự nhiên", desc: "37 tiêu bản 3D độc quyền" },
      { href: "/bao-tang/hang-khong-vu-tru", label: "Hàng không & Vũ trụ", desc: "Tàu vũ trụ, động cơ phản lực" },
      { href: "/bao-tang/lich-su-hoa-ky", label: "Lịch sử Hoa Kỳ", desc: "Di vật & văn hoá Mỹ" },
    ],
  },
  { href: "/cua-hang", label: "Cửa hàng" },
  { href: "/kham-pha", label: "Khám phá thêm" },
]
