// the site's main sections (header, mobile menu and footer all read this list)
export const NAV: { href: string; label: string; dropdown?: { href: string; label: string; desc?: string }[] }[] = [
  {
    href: "/bao-tang",
    label: "Bảo tàng",
    dropdown: [
      {
        href: "/bao-tang/lich-su-tu-nhien",
        label: "Lịch sử Tự nhiên",
        desc: "National Museum of Natural History",
      },
      {
        href: "/bao-tang/hang-khong-vu-tru",
        label: "Hàng không & Vũ trụ",
        desc: "National Air and Space Museum",
      },
      {
        href: "/bao-tang/lich-su-hoa-ky",
        label: "Lịch sử Hoa Kỳ",
        desc: "National Museum of American History",
      },
      {
        href: "/bao-tang/phong-tranh-chan-dung",
        label: "Phòng tranh Chân dung",
        desc: "National Portrait Gallery",
      },
    ],
  },
  {
    href: "/tham-quan",
    label: "Tham quan",
    dropdown: [
      { href: "/tham-quan/lich-su-tu-nhien",    label: "Lịch sử Tự nhiên",       desc: "National Museum of Natural History" },
      { href: "/tham-quan/hang-khong-vu-tru",   label: "Hàng không & Vũ trụ",    desc: "National Air and Space Museum" },
      { href: "/tham-quan/lich-su-hoa-ky",      label: "Lịch sử Hoa Kỳ",         desc: "National Museum of American History" },
      { href: "/tham-quan/phong-tranh-chan-dung",label: "Phòng tranh Chân dung",  desc: "National Portrait Gallery" },
    ],
  },
  { href: "/dat-ve", label: "Đặt vé" },
  { href: "/cua-hang", label: "Cửa hàng" },
]
